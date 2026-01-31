# Invent: Create a New ObjectiveAI Function/Profile Pair

This skill guides you through inventing a new ObjectiveAI Function and Profile pair.

## Execution

**Create a TODO list containing Steps 1-5 and execute them in precise order.**

Do not skip steps. Do not reorder steps. Complete each step before moving to the next.

## Step 1: Initialize

Run `npm run init`.

## Step 2: Check Mode

Read `.claude/plans/mode.md`.

- If the file is empty or contains only whitespace, ask the user to choose between **Back-and-forth** (collaborative) or **Autonomous** mode.
  - **Back-and-forth**: Engage with the user on ideas, propose names, and iterate together.
  - **Autonomous**: Come up with the idea and implement it entirely autonomously.
  - Update `mode.md` with the selected mode: either `back-and-forth` or `autonomous`.

- If the file already contains a mode, proceed with that mode.

## Step 3: Learn ObjectiveAI

Investigate the `objectiveai` submodule to familiarize yourself with what ObjectiveAI Functions and Profiles are:
- Read key files in `objectiveai/objectiveai-js/` and `objectiveai/objectiveai-rs/`
- Understand the structure of Functions (scalar vs vector) and Profiles (task profiles, ensembles)

## Step 4: Study Examples

1. Read `examples/examples.json` to see the root function-profile pairs
2. For each pair, open and study:
   - `examples/functions/{owner}/{repository}/{commit}/function.json`
   - `examples/profiles/{owner}/{repository}/{commit}/profile.json`
3. If any function contains sub-tasks, you may open those sub-function files
4. If any profile contains sub-profiles, you may open those sub-profile files
5. Optionally, fetch README.md or CLAUDE.md from GitHub for example repos to gather additional context

## Step 5: Check Function Plan

Read `.claude/plans/function.md`.

- If the file already contains a function plan with a repository name, skip to Step 7.
- Otherwise, proceed with Step 6 to create the plan.

## Step 6: Invent the Function

Think deeply about what function to invent:
- **Scalar Function**: For scoring (outputs a single number in [0, 1])
- **Vector Function**: For ranking (outputs scores for multiple items that sum to ~1)

**Input Schema Design**: Avoid input requirements that cannot be expressed via JSON Schema fields (e.g., "a string that must be a person's name"). Such semantic constraints are acceptable if truly necessary, but prefer schemas that are self-validating where possible.

**If back-and-forth mode**: Engage with the user on ideas. Propose the function concept and repository name together.

**If autonomous mode**: Come up with the idea independently.

### Repository Naming

The repository name = the function name. **Do NOT include "objectiveai" or "function" in the name.** Name it like you would name a function:
- Use all lowercase
- Use dashes (`-`) to separate words if there's more than one
- Examples: `sentiment-scorer`, `resume-ranker`, `code-quality`

**If back-and-forth mode**: Propose the name to the user for approval.

### Write the Plan

Write the following to `.claude/plans/function.md`:
- The repository name
- What the function does (description)
- Whether it's scalar or vector
- The input schema design
- The task structure (what tasks it will use)

## Step 7: Activate Implementation

Activate the `/invent-internal` skill to proceed with implementation.
