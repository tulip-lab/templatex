# slidev-addon-tulip-live

Optional live audience synchronization for TULIP Slidev presentations.

Install the exact stable release with `pnpm add slidev-addon-tulip-live@0.1.0`. It mounts the synchronization bridge through its own Slidev global layer, independently of the visual Theme.

Enable it in deck headmatter:

```yaml
addons:
  - slidev-addon-tulip-live
```

Synchronization remains disabled unless `VITE_SLIDE_SYNC_ENABLED=true` is set by the deployment environment.
