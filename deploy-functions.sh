#!/bin/bash

# Script to deploy all Supabase Edge Functions
# This script deploys all functions in the supabase/functions directory

set -e  # Exit on any error

echo "================================================"
echo "  Supabase Edge Functions Deployment Script"
echo "================================================"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed!"
    echo ""
    echo "To install, run:"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

# Check if we're logged in
echo "🔗 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "⚠️  Warning: You need to login to Supabase first."
    echo ""
    echo "Running: supabase login"
    supabase login
fi

# Check if project is already linked by looking at .supabase/config.toml
if [ -f ".supabase/config.toml" ]; then
    PROJECT_ID=$(grep "project_id" .supabase/config.toml | cut -d'"' -f2 2>/dev/null || echo "")
    if [ -n "$PROJECT_ID" ]; then
        echo "✅ Already linked to project: $PROJECT_ID"
        echo ""
    else
        echo "⚠️  Configuration exists but project_id not found."
        echo "   Attempting to continue anyway..."
        echo ""
    fi
else
    echo "⚠️  No Supabase configuration found."
    echo ""
    echo "Available projects:"
    supabase projects list
    echo ""
    echo "Please enter your Supabase project reference (the one marked with ●):"
    echo "Example: jsqnixorhshlrlaoneir"
    read -r PROJECT_REF

    if [ -z "$PROJECT_REF" ]; then
        echo "❌ Project reference is required. Please run the script again and enter the project ID."
        exit 1
    fi

    echo ""
    echo "Linking to project: $PROJECT_REF"
    if ! supabase link --project-ref "$PROJECT_REF"; then
        echo "❌ Failed to link to project."
        exit 1
    fi
    echo "✅ Successfully linked to project!"
    echo ""
fi

echo "📦 Deploying Edge Functions..."
echo ""

# Array of functions to deploy
FUNCTIONS=(
    "create-checkout-session"
    "send-booking-email"
    "stripe-webhook"
    "cleanup-expired-bookings"
    "cancel-booking"
    "send-cancellation-email"
)

# Track success/failure
SUCCESSFUL=()
FAILED=()

# Deploy each function
for func in "${FUNCTIONS[@]}"; do
    echo "================================================"
    echo "Deploying: $func"
    echo "================================================"

    if [ ! -d "supabase/functions/$func" ]; then
        echo "⚠️  Warning: Function directory not found: supabase/functions/$func"
        echo "Skipping..."
        FAILED+=("$func (not found)")
        echo ""
        continue
    fi

    echo "Deploying $func..."

    # Deploy all functions without JWT verification
    # Authentication is handled via service role key
    if supabase functions deploy "$func" --no-verify-jwt 2>&1; then
        echo "✅ $func deployed successfully"
        SUCCESSFUL+=("$func")
    else
        echo "❌ Failed to deploy $func"
        FAILED+=("$func")
    fi
    echo ""
done

echo ""
echo "================================================"
echo "  Deployment Summary"
echo "================================================"
echo ""

if [ ${#SUCCESSFUL[@]} -gt 0 ]; then
    echo "✅ Successfully deployed (${#SUCCESSFUL[@]}):"
    for func in "${SUCCESSFUL[@]}"; do
        echo "   - $func"
    done
    echo ""
fi

if [ ${#FAILED[@]} -gt 0 ]; then
    echo "❌ Failed to deploy (${#FAILED[@]}):"
    for func in "${FAILED[@]}"; do
        echo "   - $func"
    done
    echo ""
fi

# List all deployed functions
echo "================================================"
echo "📋 All deployed functions:"
echo "================================================"
supabase functions list

echo ""
echo "================================================"
echo "🎉 Deployment Complete!"
echo "================================================"
echo ""
echo "Your Edge Functions are now live at:"
echo "https://YOUR_PROJECT_REF.supabase.co/functions/v1/"
echo ""
echo "Available endpoints:"
for func in "${SUCCESSFUL[@]}"; do
    echo "  - https://YOUR_PROJECT_REF.supabase.co/functions/v1/$func"
done
echo ""
echo "💡 Next steps:"
echo "   1. Set up Stripe webhook in the Stripe Dashboard"
echo "      URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook"
echo "      Events: checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed, charge.refunded"
echo "   2. Verify your STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are set:"
echo "      supabase secrets list"
echo "   3. Test the booking flow with Stripe test card: 4242 4242 4242 4242"
echo ""
echo "📚 Function Endpoints:"
echo "   - create-checkout-session: Creates Stripe Checkout Session for payments"
echo "   - stripe-webhook: Handles Stripe payment events and confirms bookings"
echo "   - send-booking-email: Sends booking confirmation emails via Mailgun"
echo "   - cleanup-expired-bookings: Cancels old pending bookings to release capacity"
echo "   - cancel-booking: Handles booking cancellations with Stripe refunds"
echo "   - send-cancellation-email: Sends cancellation confirmation emails"
echo ""
echo "🔒 Security:"
echo "   - All functions deployed with --no-verify-jwt (no JWT verification)"
echo "   - Authentication handled via Supabase service role key in function calls"
echo ""
echo "⏰ Automated Cleanup:"
echo "   - GitHub Action runs cleanup-expired-bookings every hour automatically"
echo "   - Cancels pending bookings older than 2 hours to release capacity"
echo "   - Manual trigger available in GitHub Actions tab"
echo ""
