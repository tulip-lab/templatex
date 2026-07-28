<p align="center">
  <img src="graphics/logos/tulip-wordmark.png" alt="TULIP Lab" width="900">
</p>

# TULIP Lab LaTeX Paper Template

This directory contains the reusable paper, response, poster, and Powerdot
presentation templates maintained by TULIP Lab.

## Template Entry Points

- `report.tex`: default paper or technical report.
- `report-acm.tex`: ACM proceedings.
- `report-htm.tex`: tourism and hospitality manuscript.
- `report-ieee.tex`: IEEE proceedings.
- `report-lncs.tex`: Springer LNCS proceedings.
- `responses.tex`: reviewer response letter.
- `report-poster.tex`: poster.
- `report-slides.tex`: modular Powerdot presentation.

The paper entry points share `preamble.tex` and the section files under `tex/`.
The slide entry point composes:

- `tex/mod-preamble.tex`
- `tex/mod-title.tex`
- `tex/mod-slides.tex`
- `tex/mod-contact.tex`

Keep personal metadata in the entry point. Do not place personal photographs,
contact details, or project-specific content in shared modules.

## Requirements

- TeX Live with `latexmk`, pdfLaTeX, BibTeX, dvips, and ps2pdf.
- The `powerdot-tuliplab` package for slides.
- Git for revision metadata and collaborative authoring.

Recommended editors include Visual Studio Code with LaTeX Workshop, TeXstudio,
and Overleaf. Powerdot/PSTricks slides require the local DVI/PostScript build
pipeline and may need additional configuration on hosted editors.

## Build Commands

Run these commands from this directory:

```bash
latexmk -g -pdf report.tex
latexmk -g -pdf report-ieee.tex
latexmk -g -pdf responses.tex
latexmk -g -pdf report-poster.tex
latexmk -g -pdfps report-slides.tex
```

Paper-family targets use pdfLaTeX. Powerdot slides use the explicit
LaTeX-to-DVI-to-PostScript-to-PDF pipeline.

Generated output is written under `temp/` according to `latexmkrc`.

## Start A Project

1. Create a private repository for the paper or project.
2. Copy this template into the project report directory.
3. Replace sample author, title, abstract, section, and bibliography content.
4. Put project references in `yourbib.bib`.
5. Keep shared TULIP Lab references in `tuliplab.bib`.
6. Build every entry point used by the project before committing.

Avoid formatting-only changes. Start each sentence on a new line where
practical, keep automatic wrapping disabled, and review LaTeX diffs before
committing.

## GitInfo Setup

From the repository root, inspect the hook installation:

```bash
./scripts/install-gitinfo-hooks.sh
```

Install or update managed hooks explicitly:

```bash
./scripts/install-gitinfo-hooks.sh --apply
```

The installer never replaces unmanaged hooks. The generated
`templatex/gitHeadLocal.gin` file is ignored and works in both ordinary clones
and linked Git worktrees.

## Collaboration Workflow

- `main` contains reviewed stable releases.
- `develop` is the integration branch.
- `feature/*` branches contain normal changes.
- `release/*` branches prepare coordinated releases.
- `hotfix/*` branches contain urgent fixes from `main`.

Before merging:

1. Pull the latest integration branch.
2. Review the source diff and generated PDF.
3. Build all affected entry points.
4. Resolve comments and remove completed draft notes.
5. Use a descriptive commit and pull request.

Do not commit generated PDFs, auxiliary files, private review material, or
credentials.
