# slidev-theme-tulip-lab

TULIP Lab's shared 16:10 Slidev Theme for courses and talks. It provides the branded Cover, navigation shell, table of contents, section pages, references, contact page, QR code, and reusable content layouts.

Install the exact stable release with `pnpm add slidev-theme-tulip-lab@0.2.0`.

Workspace projects can use it with:

```yaml
---
theme: slidev-theme-tulip-lab
layout: cover
title: Presentation Title
course: TULIP Lab
aspectRatio: 16/10
canvasWidth: 1280
---
```

See the workspace examples for complete Course and Talk decks. Live audience synchronization is provided separately by `slidev-addon-tulip-lab-live`; standard TULIP Lab content pages are provided by `slidev-addon-tulip-lab-pages`.

`section` creates a table-of-contents and bottom-navigation item. `session` and
`sessionTitle` create a child entry in the table of contents and compact top
navigation without adding another bottom-navigation item. A session remains
active until the next `session` or `section` declaration.

Set `tocExpand: false` on a section to keep its sessions in the compact top
navigation while showing only the parent section in the table of contents.

The audience QR code uses the active Slidev base path during local development.
A deployment may set `VITE_TULIP_AUDIENCE_URL` to a relative or absolute Live
audience URL when Static and Live variants use different base paths.
