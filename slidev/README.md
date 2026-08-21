# TULIP Slidev

This workspace develops the reusable Slidev system for TULIP Lab courses and talks.

## Workspace

- `packages/slidev-theme-tulip-lab`: shared 16:10 presentation theme
- `packages/slidev-addon-tulip-live`: optional live audience synchronization
- `packages/tulip-slidev-check`: shared deck structure checks
- `packages/create-tulip-slides`: Course and Talk project creator
- `templates/`: private source templates used by the project creator
- `examples/`: private Course, Talk, and layout examples

The four public packages share the stable version `0.1.0`.

## Development

Run workspace commands from this directory:

```sh
pnpm install
pnpm check
```

## Version Policy

- Theme, addon, checker, and creator move together during the initial release train.
- Consumer projects pin exact package versions and keep independent lockfiles.
- Stable `0.1.0` requires successful AgenticAI Course migration, the first real Talk, and `slides-deploy` integration.
- Publishing, tagging, and deployment require an explicit release approval.

## Licensing

- Software code is licensed under the [MIT License](LICENSE).
- Example and template content is licensed under [CC BY 4.0](LICENSE-CONTENT).
- TULIP logos and wordmarks are governed by the [TULIP brand asset licence](LICENSE-BRAND-ASSETS.md), not by the MIT or CC BY licences.
