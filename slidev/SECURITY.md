# Dependency Security

## Accepted `image-size` risk

As of 2026-08-26, `@slidev/cli -> pptxgenjs` resolves `image-size@1.2.1`.
The package is affected by GHSA-w3rx-r6r6-pgpr (ICNS parsing) and
GHSA-5p2g-fcmc-qvqq (JXL/HEIF parsing). Both advisories describe denial of
service through malformed image data, and npm reports no patched release.

This workspace accepts the residual build and export availability risk under
these controls:

- only reviewed, version-controlled images are processed;
- the examples, templates, and visual tests have no untrusted image-input path;
- automated builds run from a pinned repository revision in an isolated CI
  runner; and
- the dependency must be upgraded and re-audited when `image-size`,
  `pptxgenjs`, or Slidev provides a patched dependency path.

`dompurify` is separately forced to `3.4.14` through the pnpm workspace
override and is not part of this accepted risk.
