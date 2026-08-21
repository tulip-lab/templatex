# slidev-addon-tulip-live

Optional live audience synchronization for TULIP Slidev presentations.

This package is under active migration and has not been published. It mounts the synchronization bridge through its own Slidev global layer, independently of the visual Theme.

Enable it in deck headmatter:

```yaml
addons:
  - slidev-addon-tulip-live
```

Synchronization remains disabled unless `VITE_SLIDE_SYNC_ENABLED=true` is set by the deployment environment.
