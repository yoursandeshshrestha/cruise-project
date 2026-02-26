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

# Check if we're linked to a project
if ! supabase status &> /dev/null; then
    echo "⚠️  Warning: Not linked to a Supabase project."
    echo ""
    read -p "Do you want to link to a project now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Please enter your Supabase project reference (found in your dashboard URL):"
        read -r PROJECT_REF
        supabase link --project-ref "$PROJECT_REF"
    else
        echo "❌ Cannot deploy without linking to a project."
        exit 1
    fi
fi

echo "📦 Deploying Edge Functions..."
echo ""

# Array of functions to deploy
FUNCTIONS=(
    "create-checkout-session"
    "send-booking-email"
    "stripe-webhook"
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

    # Deploy with appropriate flags
    if [ "$func" = "create-checkout-session" ] || [ "$func" = "stripe-webhook" ]; then
        # Public functions - no JWT verification needed (Stripe uses signatures)
        if supabase functions deploy "$func" --no-verify-jwt 2>&1; then
            echo "✅ $func deployed successfully (public access)"
            SUCCESSFUL+=("$func")
        else
            echo "❌ Failed to deploy $func"
            FAILED+=("$func")
        fi
    else
        # Protected function - requires JWT
        if supabase functions deploy "$func" 2>&1; then
            echo "✅ $func deployed successfully (protected)"
            SUCCESSFUL+=("$func")
        else
            echo "❌ Failed to deploy $func"
            FAILED+=("$func")
        fi
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
echo ""
