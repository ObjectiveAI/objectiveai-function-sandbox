import { Functions } from "objectiveai";

export const Profile: Functions.RemoteProfile = {
  description: "Placeholder profile.",
  changelog: null,
  tasks: [
    {
      ensemble: {
        llms: [
          {
            model: "openai/gpt-4.1-nano",
            output_mode: "json_schema",
          },
          {
            model: "google/gemini-2.5-flash-lite",
            output_mode: "json_schema",
          },
          {
            model: "x-ai/grok-4.1-fast",
            output_mode: "json_schema",
            reasoning: {
              enabled: false,
            },
          },
          {
            model: "openai/gpt-4o-mini",
            output_mode: "json_schema",
            top_logprobs: 20,
          },
          {
            model: "deepseek/deepseek-v3.2",
            output_mode: "instruction",
            top_logprobs: 20,
          },
        ],
      },
      profile: [1.0, 1.0, 1.0, 1.0, 1.0],
    },
  ],
};
