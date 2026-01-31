# Invent Internal: Implement the Function/Profile Pair

This skill handles the implementation phase after the function plan has been created.

## Prerequisites

Before this skill is activated:
- `.claude/plans/mode.md` contains the selected mode (back-and-forth or autonomous)
- `.claude/plans/function.md` contains the function plan with repository name

## Step 1: Create the Function in function.ts

Edit `function.ts` to implement the function from the plan.

### Function Fields

**Scalar Function** (`type: "scalar.function"`):
- `description`: What the function does
- `input_schema`: JSON Schema for input validation
- `tasks`: Array of task expressions
- `output`: Expression evaluating to number in [0, 1]

**Vector Function** (`type: "vector.function"`):
- `description`: What the function does
- `input_schema`: JSON Schema for input validation
- `tasks`: Array of task expressions
- `output`: Expression evaluating to array of numbers (sum ~1)
- `output_length`: Fixed length or expression for output vector length
- `input_split`: Transform input into array of single-item inputs
- `input_merge`: Transform array of inputs back into single input

### Task Types

- **Vector Completion Task**: `type: "vector.completion"` - LLM voting
- **Scalar Function Task**: `type: "scalar.function"` - Reference another function by owner/repo/commit
- **Vector Function Task**: `type: "vector.function"` - Reference another function by owner/repo/commit

### JMESPath Expressions

For any JMESPath expression, use a placeholder string starting with `$jmespath` followed by instructions:
```typescript
output: { $jmespath: "$jmespath: return the first task's score from tasks array" }
```

After writing function.ts with placeholders, **spawn the `jmespath-expression-writer` agent** to fill in all JMESPath expressions.

#### Iterative Communication with JMESPath Agent

The JMESPath expression writing process is iterative. You can communicate with the agent by:

1. **Initial placeholders**: Write `$jmespath: instructions describing what the expression should do`
2. **Appending feedback**: If an expression fails, append additional context to the existing expression:
   ```typescript
   output: { $jmespath: "tasks[0].scores | ERROR: got null, expected array. Check if tasks is populated" }
   ```
3. **Providing errors directly**: When spawning the agent, include relevant errors from `serverLog.txt` in your prompt
4. **Adding context**: Append information about the input structure or expected behavior

The agent will read `serverLog.txt` for error details when debugging expression issues.

## Step 2: Create the Profile in profile.ts

Edit `profile.ts` to create a supporting profile.

### Profile Structure

```typescript
{
  description: string,
  tasks: TaskProfile[],  // One per function task
}
```

### Task Profile Rules

- **For vector completion tasks**: Reuse the existing `VectorCompletionTaskProfile` already defined in `profile.ts`. Do not create new ensembles.
- **For function sub-tasks**: Reference the default profile by owner/repo/commit.

## Step 3: Create Inputs in inputs.ts

Edit `inputs.ts` to create test inputs. Create at least 10 diverse examples.

### Diversity Requirements

- Each example should have different characteristics
- Vary quality: some high, some low, some medium
- For scalar functions: vary intended scores across the full [0, 1] range
- For vector functions: vary ranking distributions
- For array inputs: vary array lengths, **include at least 1 single-item array**

After creating inputs, **spawn the `inputs-edge-case-evaluator` agent** to validate coverage. Add any missing edge cases it identifies.

## Step 4: Build and Test

Run `npm run build`.

This will:
1. Run all tests
2. Export Function to `function.json`
3. Export Profile to `profile.json`
4. Write server logs to `serverLog.txt`

### Server Logs

The server does not write output to stdout. All errors and logs are written to `serverLog.txt`. After a failed build, read this file to understand what went wrong.

### If Tests Fail

**Test failures are NEVER due to a missing API key. NO API KEY IS NEEDED FOR TESTS.**

Tests run a local server from the objectiveai submodule. If tests fail, it is due to a bug in the function or profile definition.

1. Read `serverLog.txt` to analyze the error
2. Fix the function, profile, or inputs as needed
3. If expression errors occur, spawn `jmespath-expression-writer` agent with error context from `serverLog.txt`
4. Run `npm run build` again

### Debugging with Rust Logging

You can add `println!` or `dbg!` statements in `objectiveai/objectiveai-api/src/...` to debug. These will appear in `serverLog.txt`.

**IMPORTANT**: After adding Rust logging, you MUST run:
```
npm run install-rust-logs
```
before running `npm run build`.

**DO NOT simply change inputs to ones that pass.** Fix the function logic instead.

Repeat until all tests pass.

## Step 5: Final Build

Once tests pass with `npm run build`, run:

```
npm run build-final
```

This resets any modifications to the objectiveai submodule and runs a clean build.

**If `npm run build-final` succeeds, the implementation is complete.**

## Step 6: Publish to GitHub

1. Run `git status` to see changes
2. Run `git add` to stage files (function.ts, profile.ts, inputs.ts, function.json, profile.json, README.md)
3. Run `git commit` with a descriptive message
4. Run `gh repo create {repository-name} --public --source=. --push` using the repository name from function.md

---

## File Reference

### Editable Files
- `function.ts` - Function definition
- `profile.ts` - Profile definition
- `inputs.ts` - Test inputs
- `README.md` - Documentation

### Generated Files (read-only)
- `function.json` - Exported function
- `profile.json` - Exported profile
- `serverLog.txt` - Server errors and logs from build

### Commands
- `npm run build` - Test and export
- `npm run build-final` - Reset submodule and do final build
- `npm run install-rust-logs` - Rebuild after adding Rust logging
