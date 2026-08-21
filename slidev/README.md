# TULIP Slidev

This workspace develops the reusable Slidev system for TULIP Lab courses and talks.

## Workspace

- `packages/slidev-theme-tulip-lab`: shared 16:10 presentation theme
- `packages/slidev-addon-tulip-lab-live`: optional live audience synchronization
- `packages/slidev-addon-tulip-lab-pages`: shared speaker, academy, questions, and contact pages
- `packages/tulip-slidev-check`: shared deck structure checks
- `packages/create-tulip-slides`: Course and Talk project creator
- `templates/`: private source templates used by the project creator
- `examples/`: private Course, Talk, and layout examples

The five public packages share the next release version `0.2.0`.

## Ownership

- `templatex/slidev/` is the canonical source for the Theme, live addon,
  checker, creator, source templates, and public examples.
- Course and Talk repositories own their private deck content and pin exact
  published package versions with independent lockfiles.
- `slides-deploy` owns the approved presentation catalog, production URLs,
  access control, live-session runtime, and Cloudflare deployment.
- Shared package changes are released here first, then adopted explicitly by
  each consumer before a new complete presentation snapshot is deployed.

## Development

Run workspace commands from this directory:

```sh
pnpm install
pnpm check
```

## Version Policy

- Theme, addons, checker, and creator move together during the initial release train.
- Consumer projects pin exact package versions and keep independent lockfiles.
- Stable `0.1.0` established the initial package baseline. Release `0.2.0` standardises addon names and shared presentation pages.
- Publishing, tagging, and deployment require an explicit release approval.

## Licensing

- Software code is licensed under the [MIT License](LICENSE).
- Example and template content is licensed under [CC BY 4.0](LICENSE-CONTENT).
- TULIP logos and wordmarks are governed by the [TULIP brand asset licence](LICENSE-BRAND-ASSETS.md), not by the MIT or CC BY licences.
