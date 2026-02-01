# ObjectiveAI Function Sandbox

A sandbox environment for creating ObjectiveAI Functions and Profiles.

[GitHub](https://github.com/ObjectiveAI/objectiveai) | [Website](https://objective-ai.io) | [Discord](https://discord.gg/gbNFHensby)

## What is this?

This repository is a template workspace for inventing new ObjectiveAI **Functions** (scoring/ranking pipelines) and **Profiles** (learned weights).

It includes a **Claude Code skill** (`.claude/skills/invent/SKILL.md`) that guides Claude through the entire process of inventing a new Function from scratch - from studying examples to validating the new Function/Profile pair to publishing on GitHub.

The sandbox provides all the tooling needed to:

- Define a Function and Profile in TypeScript
- Validate against the ObjectiveAI schema
- Test with example inputs
- Export to `function.json` and `profile.json`
- Publish to GitHub and the ObjectiveAI index

## Quick Start

```bash
npm install
npm run init      # Fetch example functions/profiles
npm run build     # Validate, test, and export
npm run publish   # (Optional) Index on ObjectiveAI
```

## Project Structure

```
├── function.ts       # Define your Function here
├── profile.ts        # Define your Profile here
├── inputs.ts         # Define your test inputs here (10-100 examples)
├── repository.json   # Repository name and description for GitHub
├── README.md         # Documentation (you're reading it)
├── function.json     # Generated Function output
├── profile.json      # Generated Profile output
├── examples/         # Downloaded example functions/profiles
├── objectiveai/      # ObjectiveAI SDK (git submodule)
└── .claude/          # Claude Code skills and agents
    ├── skills/       # Invent skill for creating functions
    └── agents/       # JMESPath and input validation agents
```

## Workflow

1. **Study examples** - Run `npm run init` to download example functions/profiles, then explore `examples/`
2. **Define your Function** - Edit `function.ts` to create your Function with tasks and output expressions
3. **Define your Profile** - Edit `profile.ts` to specify ensembles and weights for each task
4. **Create Inputs** - Edit `inputs.ts` with 10-100 diverse test inputs covering edge cases
5. **Build and test** - Run `npm run build` to validate and export
6. **Publish** - Run `npm run commit-and-push` to commit and push to GitHub

## Scripts

| Command | Description |
|---------|-------------|
| `npm run init` | Fetch example functions/profiles into `examples/` |
| `npm run build` | Validate, test, and export to JSON |
| `npm run build-final` | Reset submodule and run clean build |
| `npm run commit-and-push -- -m "message"` | Commit and push to GitHub (creates repo if needed) |
| `npm run publish` | Publish to ObjectiveAI index (requires API key) |

## Using with Claude Code

This sandbox includes a skill for Claude Code. To have Claude invent a new Function:

1. Open this workspace in Claude Code
2. Ask Claude to invent a new function (the skill will guide the process)
3. Claude will study examples, propose ideas, and implement the Function/Profile

The skill supports both **collaborative** (back-and-forth) and **autonomous** modes.
