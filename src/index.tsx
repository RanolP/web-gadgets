/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route } from '@solidjs/router'
import { For } from 'solid-js'

import '@fontsource/pretendard/400.css'
import '@fontsource/pretendard/500.css'
import '@fontsource/pretendard/600.css'
import '@fontsource/pretendard/700.css'
import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'
import './index.css'
import Layout from './pages/layout'
import { Routes } from './shared/routes/definition'

const root = document.getElementById('root')

render(() => (
  <Router root={Layout}>
    <For each={Routes}>
      {(route) => <Route path={route.path} component={route.component} />}
    </For>
  </Router>
), root!)