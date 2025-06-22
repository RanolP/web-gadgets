import {
  defineConfig,
  presetTypography,
  presetIcons,
  presetWind4,
} from 'unocss';

export default defineConfig({
  presets: [
    presetWind4({
      dark: 'class',
    }),
    presetTypography(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  safelist: [
    'i-tabler-qrcode',
    'i-tabler-file',
    'i-tabler-home',
    'i-tabler-menu-2',
    'i-tabler-upload',
    'i-tabler-clipboard',
    'i-tabler-copy',
    'i-tabler-check',
    'i-tabler-scan',
    'i-tabler-x',
    'i-tabler-trash',
    'i-tabler-external-link',
    'i-tabler-chevron-right',
    'i-tabler-circle-check',
    'i-tabler-refresh-alert',
    'i-tabler-circle-x',
    'i-tabler-alert-triangle',
    'i-tabler-info-circle',
    'i-tabler-crop',
  ],
  theme: {
    colors: {
      // VS Code theme colors
      vscode: {
        bg: '#1e1e1e',
        sidebar: '#252526',
        activity: '#333333',
        border: '#3e3e42',
        hover: '#2a2d2e',
        active: '#37373d',
        blue: '#007acc',
        'blue-dark': '#005a9e',
        text: '#cccccc',
        'text-dim': 'rgba(204, 204, 204, 0.6)',
        input: '#3c3c3c',
        'error-bg': '#5a1d1d',
        'error-text': '#f48771',
      },
    },
    animation: {
      keyframes: {
        'slide-up': '{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}',
      },
      durations: {
        'slide-up': '300ms',
      },
      timingFns: {
        'slide-up': 'ease-out',
      },
    },
  },
  variants: [
    {
      name: 'touch',
      match(matcher) {
        let match = /^touch:/.exec(matcher);
        if (!match) return null;

        return {
          matcher: matcher.slice(match[0].length),
          handle: (input, next) =>
            next({
              ...input,
              parent: `${
                input.parent ? `${input.parent} $$ ` : ''
              } @media (hover: none) and (pointer: coarse)`,
            }),
        };
      },
      autocomplete: 'touch:',
    },
    {
      name: 'not-touch',
      match(matcher) {
        let match = /^not-touch:/.exec(matcher);
        if (!match) return null;

        return {
          matcher: matcher.slice(match[0].length),
          handle: (input, next) =>
            next({
              ...input,
              parent: `${
                input.parent ? `${input.parent} $$ ` : ''
              } @media not (hover: none) and not (pointer: coarse)`,
            }),
        };
      },
    },
  ],
  shortcuts: {
    'vscode-button':
      'px-4 py-2 bg-vscode-blue text-white rounded hover:bg-vscode-blue-dark transition-colors',
    'vscode-input':
      'px-3 py-2 bg-vscode-input border border-vscode-border rounded text-vscode-text focus:outline-none focus:border-vscode-blue',
  },
});
