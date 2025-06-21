# Project Conventions for Web Gadgets

## Naming Conventions
- **All source files inside src/ must use kebab-case** (e.g., `qr-scanner.tsx`, `color-picker.page.tsx`)
- Pages following soonloh's snzrwm rules must end with `.page.tsx`
- When a page has its own folder, the page file is named `page.tsx` (e.g., `(index)/page.tsx`)

## Directory Structure
```
src/
├── pages/
│   ├── layout.tsx               # Root layout component
│   ├── (index)/                 # Grouping folder for index page
│   │   ├── page.tsx             # Home page
│   │   └── gadgets.ts           # Gadget metadata
│   └── (gadgets)/               # Grouping folder for gadgets
│       ├── qr-scanner.page.tsx  # QR Scanner page with component
│       └── color-picker.page.tsx # Color Picker page with component
└── shared/
    └── routes/
        └── definition.ts        # Route definitions
```
- No root-level gadgets folder
- Gadget components are directly in their `.page.tsx` files (no separate component files)
- Layout and data files are colocated with related pages
- Grouping folders use parentheses and don't affect routes

## Routing
- All route definitions must be in `src/shared/routes/definition.ts`
- The definition file must export only one thing: `Routes` const typed as `RouteDefinition[]`
- All paths must be inlined in the route definitions
- Example:
  ```typescript
  export const Routes: RouteDefinition[] = [
    { path: '/', component: lazy(() => import('../../pages/(index)/page')) },
    { path: '/qr-scanner', component: lazy(() => import('../../pages/(gadgets)/qr-scanner.page')) },
  ]
  ```

## Technology Stack
- Vite + Solid.js + TypeScript
- UnoCSS for styling
- @solidjs/router for routing
- @zxing/browser for QR scanning
- cropperjs for image cropping

## Important Notes
- Prefer web-native listeners and APIs
- Each gadget should have its own dedicated path (not dynamic routing)
- Gadget metadata is stored separately in `src/data/gadgets.ts`
- The Layout component is passed as the `root` prop to the Router