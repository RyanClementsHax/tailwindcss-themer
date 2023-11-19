# Migrating <!-- omit in toc -->

- [From v3 to v4](#from-v3-to-v4)
- [From v2 to V3](#from-v2-to-v3)
- [From v1 to V2](#from-v1-to-v2)

## From v3 to v4

Alpha channels in colors are no longer stripped. If you want the alpha channels stripped still, either do so manually or change the classes you are using to use the [opacity modifier syntax](https://tailwindcss.com/docs/upgrade-guide#new-opacity-modifier-syntax) with the opacity set to `100` e.g. from `bg-primary` to `bg-primary/100`.

## From v2 to V3

The types this plugin used for tailwind's config are no longer exported. Use [tailwind's types](https://tailwindcss.com/docs/configuration#type-script-types) instead.

## From v1 to V2

The plugin will no longer add the [prefix](https://tailwindcss.com/docs/plugins#prefix-and-important-1) to any theme or default classes because they are base styles (more details [here](https://tailwindcss.com/docs/plugins#adding-base-styles)).
