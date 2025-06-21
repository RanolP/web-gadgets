# Web Gadgets

A collection of useful web utilities built with Vite, Solid.js, and UnoCSS.

## Project Structure

Following soonloh's snzrwm routing convention:
- Pages in `src/pages/` end with `.page.tsx`
- Each gadget has its own dedicated route
- Routes are defined in `src/shared/routes/definition.ts`

## Available Gadgets

- **Color Picker** (`/color-picker`) - Pick and convert colors between different formats

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```