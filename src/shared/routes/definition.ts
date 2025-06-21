import { lazy } from 'solid-js';
import type { RouteDefinition } from '@solidjs/router';

export const Routes: RouteDefinition[] = [
  {
    path: '/',
    component: lazy(() => import('../../pages/(index)/page')),
  },
  {
    path: '/qr-scanner',
    component: lazy(() => import('../../pages/(gadgets)/qr-scanner/page')),
  },
];
