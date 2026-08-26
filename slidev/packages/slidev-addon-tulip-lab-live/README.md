# slidev-addon-tulip-lab-live

Optional live audience synchronization for TULIP Lab Slidev presentations.

Install the exact release with `pnpm add slidev-addon-tulip-lab-live@0.4.0`. It mounts the synchronization bridge through its own Slidev global layer, independently of the visual Theme.

Enable it in deck headmatter:

```yaml
addons:
  - slidev-addon-tulip-lab-live
```

Synchronization remains disabled unless `VITE_SLIDE_SYNC_ENABLED=true` is set by the deployment environment.

When enabled, the Live Presenter is authoritative for slide navigation, click reveals, and Slidev drawings. Drawings are synchronized while the presenter is drawing, committed at the end of each stroke, retained per slide for late viewers, and cleared when the live session ends. Audience views remain read-only.

Use **Presenter Fullscreen** in Live Presenter to switch to a clean, full-screen controller that can still navigate and draw. The ordinary Play view remains an audience view and cannot control a live session.
