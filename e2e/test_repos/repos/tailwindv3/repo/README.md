# React + TypeScript + Vite

This is an application designed for e2e testing `tailwindcss-themer`

## Setup

- `npm install`
- Configure `dev/tailwind.config.js` with whatever you need to test out. Do be aware that tailwind purges classes not found on the content path. So arbitrary classes being added into the text boxes on the application won't work unless configured in here.
- `npm run dev`

## Linting

`npm run lint`

## Building

`TAILWIND_CONFIG_PATH=./dev/tailwind.config.js npm run build`
`npm run serve`
