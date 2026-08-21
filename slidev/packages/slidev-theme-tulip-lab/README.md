# slidev-theme-tulip-lab

TULIP Lab's shared 16:10 Slidev Theme for courses and talks. It provides the branded Cover, navigation shell, table of contents, section pages, references, contact page, QR code, and reusable content layouts.

This package is under active migration and has not been published.

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

See the workspace examples for complete Course and Talk decks. Live audience synchronization is provided separately by `slidev-addon-tulip-live`.

The audience QR code uses the active Slidev base path during local development.
A deployment may set `VITE_TULIP_AUDIENCE_URL` to a relative or absolute Live
audience URL when Static and Live variants use different base paths.
