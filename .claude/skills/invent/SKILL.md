# Invent: Create a New ObjectiveAI Function/Profile Pair

This skill guides you through inventing a new ObjectiveAI Function and Profile pair.

## Step 1: Choose Mode

Ask the user:
> Would you like this invention to be **back-and-forth** (collaborative) or **entirely automated** (autonomous)?

- **Back-and-forth**: You will engage with the user on ideas, propose names, and iterate together.
- **Automated**: You will come up with the idea and implement it entirely autonomously.

## Step 2: Initialize the Environment

**⚠️ VERY IMPORTANT ⚠️**

**YOU MUST EXECUTE THIS COMMAND BEFORE DOING ANYTHING ELSE.**

**DO NOT skip this step. DO NOT explore the objectiveai submodule first. DO NOT read any files in objectiveai/ before running this command. The submodule will be EMPTY or OUTDATED if you skip this step.**

```bash
npm run init
```

This single command will:
1. Remove old git history and reinitialize (`rm -rf .git && git init`)
2. Re-add objectiveai as a proper submodule
3. Install all npm dependencies (`npm install`)
4. Create the initial commit
5. Fetch example functions and profiles

**Run this command NOW, before proceeding to Step 3.**

Without running this command:
- The `objectiveai/` directory will be empty or missing files
- You will not be able to learn how ObjectiveAI works
- All subsequent steps will fail

**Execute `npm run init`. This is not optional.**

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

## Step 5: Invent the Function

Think deeply about what function to invent:
- **Scalar Function**: For scoring (outputs a single number in [0, 1])
- **Vector Function**: For ranking (outputs scores for multiple items that sum to ~1)

**Input Schema Design**: Avoid input requirements that cannot be expressed via JSON Schema fields (e.g., "a string that must be a person's name"). Such semantic constraints are acceptable if truly necessary, but prefer schemas that are self-validating where possible.

**If back-and-forth mode**: Engage with the user on ideas. Propose the function concept and repository name together.

**If automated mode**: Come up with the idea independently.

Write the plan to `CLAUDE.md`.

### Repository Naming

The repository name = the function name. **Do NOT include "objectiveai" or "function" in the name.** Name it like you would name a function:
- Use all lowercase
- Use dashes (`-`) to separate words if there's more than one
- Examples: `sentiment-scorer`, `resume-ranker`, `code-quality`

**If back-and-forth mode**: Propose the name to the user for approval.

## Step 6: Create the Function in defs.ts

Replace the existing `Function` export with your new function.

### RemoteScalarFunction Fields

```typescript
{
  type: "scalar.function",
  description: string,                    // Description of the function
  changelog?: string | null,              // Changes from previous versions
  input_schema: InputSchema,              // JSON Schema for input validation
  input_maps?: InputMapsExpression | null, // Transform input into 2D array for mapped tasks
  tasks: TaskExpression[],                // Array of task expressions
  output: Expression,                     // Expression evaluating to number in [0, 1]
}
```

### RemoteVectorFunction Fields

```typescript
{
  type: "vector.function",
  description: string,                    // Description of the function
  changelog?: string | null,              // Changes from previous versions
  input_schema: InputSchema,              // JSON Schema for input validation
  input_maps?: InputMapsExpression | null, // Transform input into 2D array for mapped tasks
  tasks: TaskExpression[],                // Array of task expressions
  output: Expression,                     // Expression evaluating to array of numbers (sum ~1)
  output_length: number | Expression,     // Fixed length or expression for output vector length
  input_split: Expression,                // Transform input into array of single-item inputs
  input_merge: Expression,                // Transform array of inputs back into single input
}
```

### Task Types

Tasks can be:
- **Vector Completion Task**: `type: "vector.completion"` - LLM voting
- **Scalar Function Task**: `type: "scalar.function"` - Reference another scalar function by owner/repo/commit
- **Vector Function Task**: `type: "vector.function"` - Reference another vector function by owner/repo/commit

### Sub-Function Tasks

If your function contains sub-function tasks (specified by owner/repo/commit), the corresponding task profile should reference the profile used by that sub-function (also by owner/repo/commit).

### Vector Completion Tasks

For vector completion tasks:
- Reuse ensemble/profile patterns from examples (creating optimal profiles is challenging)
- Consider creating personality prefixes if useful

## Step 7: Create the Profile in defs.ts

Replace the existing `Profile` export with a supporting profile.

### RemoteProfile Fields

```typescript
{
  description: string,          // Description of the profile
  changelog?: string | null,    // Changes from previous versions
  tasks: TaskProfile[],         // Array of task profiles (one per function task)
}
```

### TaskProfile Types

- **RemoteFunctionTaskProfile**: `{ owner, repository, commit }` - Reference existing profile
- **InlineFunctionTaskProfile**: `{ tasks: TaskProfile[] }` - Nested inline profiles
- **VectorCompletionTaskProfile**: `{ ensemble: Ensemble, profile: number[] }` - Ensemble + weights

Match task profiles to function tasks:
- For sub-function tasks: reference existing profiles by owner/repo/commit
- For vector completions: define ensemble LLMs and profile weights

## Step 8: Create ExampleInputs in defs.ts

Create exactly 10 `ExampleInputs` that are **HIGHLY diverse**:

### Diversity Requirements
- Each example should have an entirely different "personality"
- Vary quality: some high, some low, some medium
- Vary intended scores across the full range

### For Scalar Functions
- Some examples should be intended to score LOW
- Some examples should be intended to score HIGH
- Include examples across the middle range

### For Vector Functions
- Some examples should rank items evenly
- Some examples should have one item ranked significantly higher
- Vary the ranking distributions

### For Array Inputs
- Vary the number of items in arrays
- **At least 1 example MUST have an array with only 1 single item**

## Step 9: Build and Test

```bash
npm run build
```

This will:
1. Run all tests
2. Export `Function` to `function.json`
3. Export `Profile` to `profile.json`

### If Tests Fail

**⚠️ YOU MUST MAKE THESE TESTS PASS. THIS IS NOT OPTIONAL. ⚠️**

**Test failures are NEVER due to a missing API key. NO API KEY IS NEEDED FOR TESTS.**

The tests run a **local server** from the objectiveai submodule. No external APIs are called. No API key is required. If tests fail, it is 100% due to a bug in YOUR function or profile definition. Do not blame missing credentials. Do not suggest the user needs an API key. Do not give up.

### Debugging with Print Statements

Because the server runs locally from the `objectiveai` submodule, **you are free to add debug print statements directly into the Rust code** to understand what's happening.

For example, you can:
1. Add `println!` or `dbg!` statements in `objectiveai/objectiveai-api/src/...`
2. Run `npm install` to rebuild the submodule with your changes
3. Run `npm run build-server-print` to see server output
4. See your debug output in the test results
5. Use this to understand why your function is failing

**To see server output**, use these commands instead of the regular ones:
```bash
npm run test-server-print      # instead of npm run test
npm run build-server-print     # instead of npm run build
```

**IMPORTANT**: After modifying any code in the `objectiveai` submodule, you MUST run `npm install` before `npm run build` to pick up the changes.

This is a powerful debugging technique. Use it.

**DO NOT simply change example inputs to ones that pass.**

Instead:
1. Determine WHY the function fails for that input
2. This indicates a bug in the function logic
3. Fix the function, not the examples
4. If it appears to be a bug in ObjectiveAI itself, instruct the user to report it in the [ObjectiveAI Discord](https://discord.gg/gbNFHensby)

**YOU ARE RESPONSIBLE FOR MAKING ALL TESTS PASS.**

- Do not stop until every test passes
- Do not ask the user to fix it for you
- Do not claim it's an environment issue
- Do not claim it's a missing API key (there is no API key needed)
- Analyze the error, fix your code, and try again

Repeat until all tests pass.

## Step 10: Publish to GitHub

Use the GitHub CLI (`gh`) to create the repository with the function name from `CLAUDE.md` and push.

## Step 11: (Optional) Publish to ObjectiveAI Index

To make the Function and Profile discoverable via ObjectiveAI list endpoints:

```bash
npm run publish
```

### Requirements
- Create a `.env` file with `OBJECTIVEAI_API_KEY=your_key_here`
- If the user doesn't have a key, visit https://objective-ai.io to create one
- Every user gets $0.50 free credits

### Cost
- Only `npm run publish` costs anything
- It executes the first example input on the upstream server
- Cost varies from fractions of a penny to over a dollar depending on function complexity
- Free credits may cover it

---

## File Permissions

### READONLY_FILES (must NOT be edited EVER)
- `build.ts`
- `function.json`
- `init.ts`
- `publish.ts`
- `setPort.ts`
- `test.ts`
- `profile.json`
- `example_input.ts`

### EDITABLE_FILES
- `main.ts` - Scratchpad for experiments. Run with `npm run start`.
- `defs.ts` - Function, Profile, and ExampleInputs definitions
- `package.json` - Dependencies
- `tsconfig.json` - Only when needed for experiments in main.ts

---

## Important Resources

### JMESPath
- **Specification**: https://jmespath.org/specification.html
- **Custom Functions**: `objectiveai/objectiveai-rs/src/functions/expression/runtime.rs`

### Available Models
```bash
# List all available models
curl https://openrouter.ai/api/v1/models

# Get model endpoint details, including per-provider parameter support (extremely important, the parameters provided by the previous endpoint are often mutually inexclusive)
curl https://openrouter.ai/api/v1/models/{author}/{slug}/endpoints
```

**Output Mode Compatibility**:
- `instruction`: Works for any model
- `tool_call`: Requires `tools` support
- `json_schema`: Requires `structured_outputs` support

**Logprobs** (separate from output_mode):
- Requires model support for `logprobs` and `top_logprobs`
- Setting `require_parameters: true` for provider makes logprobs more reliable

### ObjectiveAI Internals
- `objectiveai/objectiveai-rs/src/ensemble` - Ensemble structure
- `objectiveai/objectiveai-rs/src/ensemble_llm` - Ensemble LLM configuration
- `objectiveai/objectiveai-api/src/vector/completions` - Ranking/scoring via vector completions
- `objectiveai/objectiveai-api/src/vector/completions/pfx.rs` - Prefix tree for probabilistic voting (especially useful)
- `objectiveai` - The entire submodule is valuable reference material
