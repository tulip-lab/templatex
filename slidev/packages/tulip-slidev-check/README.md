# tulip-slidev-check

Shared structure and metadata checks for TULIP Slidev courses and talks.

## Usage

Install the checker in a deck and pin its exact version:

```sh
pnpm add -D tulip-slidev-check@0.1.0
pnpm exec tulip-slidev-check --profile talk .
```

Use `--profile course` for Course decks. The checker validates:

- the `slidev-theme-tulip-lab` Theme and the shared 16:10 geometry;
- Cover, TOC, and Contact structure;
- title, subtitle, series/course, author, and affiliation metadata;
- required package declarations with exact or local development versions;
- non-empty alt text for Markdown and HTML images;
- the live addon for the Course profile.

The command exits with status 1 and reports all detected issues when validation fails.
