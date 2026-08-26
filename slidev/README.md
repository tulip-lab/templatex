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

The public packages use independently reviewed release versions. Their exact
versions live in the package manifests and are checked by the workspace
validator.

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

## Visual regression

The layout gallery contains the canonical fixtures for shared surface,
balanced-body, long-title, staged-switch, and shared identity-page behaviour.
Install Chromium once, then compare the fixtures with their reviewed
1280 x 800 baselines:

```sh
pnpm exec playwright install chromium
pnpm check:visual
```

Reviewed pixel baselines are maintained on macOS, where the presentation fonts
are authored and approved. The Theme bundles its pinned OFL-licensed serif and
sans faces, removing dependence on local system fonts. CI runs the same browser audit for overflow, type
floors, white-on-white surfaces, takeaway spacing, and switch stability on
Linux, while leaving pixel comparison to the reviewed macOS baselines.

When an intentional theme change has been reviewed in the browser, update the
baselines explicitly with `pnpm update:visual`. Do not update snapshots merely
to make a failing comparison pass. Test artifacts are written under `output/`
and remain untracked; approved baseline images live beside the visual test.

Browser rasterisation can still vary by platform. Review and add a baseline
explicitly before enabling pixel comparison on another operating system.

Every new shared visual primitive should have all three forms of evidence: a
documented entry in the Theme visual contract, a structural contract test, and
a layout-gallery screenshot fixture.

Audit every page and click state of a real consumer deck with:

```sh
pnpm check:deck-visual -- /absolute/path/to/deck
```

The command starts the deck on a free local port, writes screenshots, an HTML
contact sheet, and a machine-readable report under `output/deck-visual/`, and
fails only for error-level findings. Warnings and human-review prompts remain in
the report. Use `visualAudit: sparse` only for an intentionally sparse slide;
Section, Questions, Contact, and Cover layouts are exempt automatically.

## Live local consumer preview

Link both unpublished visual packages into an installed Course or Talk without
changing that consumer's manifest, lockfile, or workspace configuration:

```sh
pnpm link:consumer -- /absolute/path/to/deck
pnpm link:consumer -- --check /absolute/path/to/deck
pnpm link:consumer -- --restore /absolute/path/to/deck
```

The command replaces only the consumer's installed Theme and pages-addon
symlinks. It records their previous targets under the consumer's ignored
`node_modules/` state so `--restore` can put them back exactly. It refuses to
replace regular files or directories and verifies the resolved source paths,
coordinated package versions, and required shared media.

After linking, restart the consumer's Slidev process with forced Vite dependency
optimization, then run its production build:

```sh
pnpm exec slidev --force
pnpm build
```

This command is for live local visual work. Use the isolated tarball validator
below for release-like evidence.

## Consumer validation

Validate an existing Course or Talk against the unpublished workspace packages
without changing that consumer's manifest, lockfile, or installed dependencies:

```sh
pnpm check:consumer -- --profile course /absolute/path/to/deck
pnpm check:consumer -- --profile talk /absolute/path/to/deck
```

When a deck intentionally imports a file from a sibling directory, mirror the
deployment checkout by adding the path relative to the deck. Repeat
`--include` when more than one external path is required:

```sh
pnpm check:consumer -- --profile course /absolute/path/to/deck \
  --include ../another-deck/components/SharedComponent.vue
```

The command copies the deck to a temporary directory, packs each declared local
Theme, addon, and checker into the same tarball form used for publication, then
installs those archives and runs the shared checker and a production build.
This catches package allowlist and bundled-asset omissions without changing the
consumer. The temporary copy is removed after the checks finish. Use `--keep`
only when the isolated copy is needed for debugging.

## Version Policy

- Coordinate version changes when a shared contract requires updates across
  the Theme, addons, checker, or creator; otherwise keep each reviewed package
  on its existing exact version.
- Consumer projects pin exact package versions and keep independent lockfiles.
- Stable `0.1.0` established the initial package baseline. Release `0.2.0` standardises addon names and shared presentation pages.
- Release `0.3.0` coordinates the Theme and pages visual contract and strengthens shared deck validation. The unchanged live addon remains at `0.2.0`.
- Release `0.3.1` refines TOC branding, responsive and keyboard navigation,
  and packaged media size while preserving the `0.3.x` visual contract.
- Publishing, tagging, and deployment require an explicit release approval.

## Licensing

- Software code is licensed under the [MIT License](LICENSE).
- Example and template content is licensed under [CC BY 4.0](LICENSE-CONTENT).
- TULIP logos and wordmarks are governed by the [TULIP brand asset licence](LICENSE-BRAND-ASSETS.md), not by the MIT or CC BY licences.
