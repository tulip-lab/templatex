# Visual Contract

This document defines the public visual API of `slidev-theme-tulip-lab`.
Deck-specific selectors and one-off compositions are not part of this contract.

## Principles

- The canvas is white; ordinary content surfaces are visibly tinted.
- Purple communicates structure and selection.
- Red, amber, and green are reserved for risk, warning, validation, or outcome.
- Headings and prose use the reference serif. Labels, metadata, and compact
  interface text use the sans face.
- Shared content uses flat surfaces and visible rules, not decorative shadows
  or gradients.
- Layout primitives provide stable dimensions; decks own their subject-specific
  grids, charts, illustrations, and dense-state typography.

## Section, session, and title hierarchy

- `section` is the stable navigation category and should remain consistent
  across all slides in that part of the deck.
- `sessionTitle` is a concise recurring navigation label, such as `AI Moment`.
  It identifies a sequence without replacing the slide's message.
- The H1 is the slide's assertion, question, or narrative headline. It may use
  the session label as a prefix, for example
  `AI Moment: From Provocation to Discovery`.
- Keep generic numbering such as `Section 2` or `Work 3` in navigation metadata,
  not in the H1 or takeaway.

This hierarchy keeps navigation predictable while allowing each slide to state
one specific claim.

## Public tokens

Typography:

- `--tulip-reference-serif`
- `--tulip-serif`
- `--tulip-sans`
- `--tulip-body-size`
- `--tulip-small-size`
- `--tulip-label-size`
- `--tulip-caption-size`
- `--tulip-card-title-size`
- `--tulip-title-size-long`

Surfaces and rules:

- `--tulip-canvas`
- `--tulip-block-surface-inset`
- `--tulip-block-surface-subtle`
- `--tulip-block-surface`
- `--tulip-block-surface-soft`
- `--tulip-block-surface-strong`
- `--tulip-block-rule`
- `--tulip-block-rule-strong`
- `--tulip-text-muted`
- `--tulip-shadow`
- `--tulip-shadow-raised`

Staged-state aliases:

- `--tulip-state-idle`
- `--tulip-state-active`
- `--tulip-state-output`

Use the state aliases for interaction meaning and the surface tokens for visual
depth. Do not add deck-local aliases for these tokens.

## Surface classes

- `.tulip-card` is the default visible content surface.
- `.tulip-card--subtle`, `.tulip-card--soft`, and `.tulip-card--strong` express
  increasing visual emphasis within the purple surface family.
- `.tulip-purpose` provides compact reading guidance below a title.
- `.tulip-takeaway` provides the concluding assertion.
- `.tulip-long-title` allows a two-line title without shrinking the slide body.

Colour-named card variants remain available for genuine semantics and backward
compatibility. They should not be used merely to make peer cards look different.

## Balanced body

The balanced body contract is opt-in:

1. Add `.tulip-balanced` to the Slidev layout class.
2. Wrap the main evidence in `.tulip-balanced-content`.
3. Keep `.tulip-takeaway--bottom` as a sibling of that wrapper.
4. Add `.tulip-fill-grid` to a repeated-item grid and `.tulip-fill-card` to its
   cards when the items should share the available height.

The contract owns the vertical allocation between evidence and takeaway. It
does not prescribe the evidence grid columns or the content inside each card.
Section, Questions, and Contact pages may remain intentionally centred.

## Staged switch

A staged switch uses these classes as one structure:

- `.tulip-switch` creates the fixed rail and flexible stage tracks.
- `.tulip-switch-rail` distributes steps without changing the overall height.
- `.tulip-switch-step` uses the idle state by default.
- `.tulip-switch-step.is-active` marks the current state.
- `.tulip-switch-step.is-output` marks a genuine result state.
- `.tulip-switch-stage` provides the stable evidence frame.

The deck controls state with Slidev `$clicks` and owns the content inside the
stage. Every state must remain independently legible and must not resize the
outer switch.

## Semantic visuals

An explanatory visual must make its claim readable without relying on speaker
narration or an accessibility-only label:

- visibly label the source or input;
- visibly label the transformation, filter, comparison, or decision;
- visibly label the outcome, including excluded or less-visible evidence when
  that distinction is part of the claim;
- preserve reading order, geometry, and colour meaning when the visual recurs.

Do not use abstract paper stacks, decorative marks, or unlabeled connectors as
substitutes for an evidence model. An `aria-label` supports accessibility but
does not replace labels that the audience can see. Compose one-off diagrams
from the existing surface and layout primitives; promote a dedicated diagram
API only after the same semantic structure is stable in another deck.

## Projection legibility

- Body copy must use `--tulip-body-size` or a larger size.
- Supporting copy must use at least `--tulip-small-size`.
- Captions, metadata, and compact labels must not be smaller than
  `--tulip-caption-size`.
- Muted text must remain readable on a classroom projector; hierarchy should
  come from weight and placement before reduced contrast.
- Title, purpose, evidence, and takeaway must fit without clipping, collisions,
  or an unexplained gap above a bottom takeaway.

Review each changed state at the standard 1280x800 viewport. Structural tests
can detect missing visible labels, and visual audits can detect small text,
overflow, unstable geometry, white surfaces on a white canvas, and excessive
takeaway gaps. They cannot prove that a diagram communicates the intended
meaning, so every new visual still requires full-size human review.

## Compatibility boundary

The following belong in individual decks until they are independently needed
by another deck:

- domain-specific card and figure names;
- page-number selectors;
- fixed heights copied for one composition;
- research-specific colour aliases;
- one-off image crops and dense-state font adjustments.

This boundary includes deck-specific evidence diagrams and selectors such as
`clr-review-*`. The theme does not currently expose a `tulip-flow-*` API.

Promoting a new primitive requires documentation here, a structural contract
test, and a visual fixture in the layout gallery.
