# Admin Components (shadcn/ui)

This directory contains admin-only components built with shadcn/ui.

## Important Notes

- **shadcn/ui components are ONLY for admin pages** (`/admin` routes)
- All admin pages MUST use `AdminLayout` wrapper to apply shadcn styles
- Client pages use custom components from `components/client/`
- shadcn CSS variables are scoped to `[data-admin-page]` attribute

## Usage

```tsx
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/admin/ui/button';

export const MyAdminPage = () => {
  return (
    <AdminLayout>
      <Button>Click me</Button>
    </AdminLayout>
  );
};
```

## Available Components

All 57 shadcn/ui components are available in `components/admin/ui/`:

- accordion, alert, alert-dialog, aspect-ratio, avatar
- badge, breadcrumb, button, button-group
- calendar, card, carousel, chart, checkbox, collapsible, combobox, command, context-menu
- dialog, direction, drawer, dropdown-menu
- empty
- field, form
- hover-card
- input, input-group, input-otp, item
- kbd
- label
- menubar
- native-select, navigation-menu
- pagination, popover, progress
- radio-group, resizable
- scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch
- table, tabs, textarea, toggle, toggle-group, tooltip

## Path Aliases

- `@/components/admin/ui/*` - shadcn UI components
- `@/lib/utils` - Utility functions (cn, etc.)
- `@/hooks/*` - React hooks
