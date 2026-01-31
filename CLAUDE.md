## Allowed Commands

"TaskOutput",
"Glob",
"Grep",
"KillShell",
"Read",
"Task",
"TaskCreate",
"TaskGet",
"TaskList",
"TaskUpdate",
"Bash(npm run init)",
"Bash(npm run build)",
"Bash(npm run build-final)",
"Bash(npm run install-rust-logs)",
"Bash(npm install)",
"Bash(npm run commit-and-push *)",
"Bash(git submodule update *)",
"Bash(ls*)",
"Bash(cd)",
"Bash(cat)",
"Bash(diff)",
"Edit(./.claude/plans/mode.md)",
"Edit(./.claude/plans/function.md)",
"Edit(./objectiveai/objectiveai-api/src/**)",
"Edit(./objectiveai/objectiveai-rs/src/**)",
"Edit(./objectiveai/objectiveai-rs-wasm-js/src/**)",
"Edit(./function.ts)",
"Edit(./inputs.ts)",
"Edit(./profile.ts)",
"Edit(./README.md)",
"Edit(./repository.json)",
"ExitPlanMode",
"Skill",
"WebFetch",
"WebSearch"

The assistant will never try to invoke any other commands. The assistant will not combine bash commands with '&&'.

---

## Resources

### JMESPath
- **Specification**: WebFetch `https://jmespath.org/specification.html`
- **Custom Functions**: `objectiveai/objectiveai-rs/src/functions/expression/runtime.rs`

### Available Models
- **List all models**: WebFetch `https://openrouter.ai/api/v1/models`
- **Get model endpoint details**: WebFetch `https://openrouter.ai/api/v1/models/{author}/{slug}/endpoints`
  - This is extremely important - the parameters from the list endpoint are often mutually exclusive across providers

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

### Server Logs
- `serverLog.txt` - Contains all server errors and logs from `npm run build`. The server does not write to stdout; read this file to debug test failures.

### Compiled Tasks
- `compiledTasks.json` - Contains the compiled tasks for each input from `npm run build`. Useful for debugging JMESPath expressions and understanding how tasks are compiled.