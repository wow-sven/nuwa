import { CapKit } from "../src/index";
import { describe, it } from '@jest/globals';
import { setupEnv } from "./setup";
import { SignerInterface } from "@nuwa-ai/identity-kit";

describe("CapKit", () => {
  let capKit: CapKit;
  let signer: SignerInterface;
  beforeAll(async () => {
    const { capKit: a, signer: s } = await setupEnv();
    capKit = a;
    signer = s;
  }, 60000)

  it("should register a cap", async () => {
    const did = await signer.getDid();
    const result = await capKit.registerCap(
      {
        id: did,
        idName: "test_cap",
        authorDID: `${did}:test_cap`,
        core: {
          mcpServers: {},
          prompt: {
            suggestions: ['hello', 'hi'],
            value: 'nuwa test cap'
          },
          model: {
            context_length: 1000,
            id: 'openai/gpt-4o-mini',
            name: 'GPT-4o-mini',
            slug: 'test_model',
            providerName: 'OpenAI',
            providerSlug: 'openai',
            description: "GPT-4o mini is OpenAI's newest model after [GPT-4 Omni](/models/openai/gpt-4o), supporting both text and image inputs with text outputs.\n\nAs their most advanced small model, it is many multiples more affordable than other recent frontier models, and more than 60% cheaper than [GPT-3.5 Turbo](/models/openai/gpt-3.5-turbo). It maintains SOTA intelligence, while being significantly more cost-effective.\n\nGPT-4o mini achieves an 82% score on MMLU and presently ranks higher than GPT-4 on chat preferences [common leaderboards](https://arena.lmsys.org/).\n\nCheck out the [launch announcement](https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/) to learn more.\n\n#multimodal",
            pricing: {
              image_per_k_images: 0.217,
              input_per_million_tokens: 0.15,
              output_per_million_tokens: 0.6,
              request_per_k_requests: 0,
              web_search_per_k_searches: 0
            },
            supported_inputs: ['text', 'image', 'file'],
            supported_parameters: [
              "max_tokens",
              "temperature",
              "top_p",
              "stop",
              "frequency_penalty",
              "presence_penalty",
              "web_search_options",
              "seed",
              "logit_bias",
              "logprobs",
              "top_logprobs",
              "response_format",
              "structured_outputs",
              "tools",
              "tool_choice"
            ]
          }
        },
        metadata: {
          "displayName": "nuwa_test",
          "description": "nuwa test cap nuwa test cap nuwa test cap",
          "tags": [
              "Coding"
          ],
          "submittedAt": 1754936939396,
          "thumbnail": {
              "type": "url",
              "url": "https://nuwa.dev/_next/image?url=%2Flogos%2Fbasic-logo_brandcolor.png&w=256&q=75"
          }
      }
      },
    );
    console.log(result)

    await new Promise(resolve => setTimeout(resolve, 35000));

    const result3 = await capKit.queryWithName('test');

    console.log(result3)
    // expect(result3.).toEqual(1)

  }, 1000000); // 30 second timeout for blockchain operations
});
