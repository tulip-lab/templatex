# create-tulip-slides

Project creator for TULIP Slidev courses and talks.

## Usage

Create a Talk:

```sh
pnpm dlx create-tulip-slides@0.2.0 talk walking-and-working-with-ai
```

Create a Course:

```sh
pnpm dlx create-tulip-slides@0.2.0 course agentic-ai
```

The command is non-interactive and writes only to a new or empty target directory. Generated projects pin exact versions of Slidev, Vue, the TULIP Lab Theme, standard pages addon, and checker. Course projects also include the live audience addon; Talk projects do not include live synchronization by default.

Template content is distributed under CC BY 4.0. A generated presentation remains `UNLICENSED` until its author chooses a licence; `TEMPLATE-LICENSE.md` records the template attribution terms.
