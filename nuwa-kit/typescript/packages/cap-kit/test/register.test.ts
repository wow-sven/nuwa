import { CapKit } from "../src/index";
import { describe, it} from '@jest/globals';
import { setupEnv } from "./setup";

describe("CapKit", () => {
  let capKit: CapKit;
  beforeAll(async () => {
    const { capKit: a } = await setupEnv('test');
    capKit = a;
  })

  it("should register a cap", async () => {
    const result = await capKit.registerCap(
      "test_cap",
      "test_cap",
      {},
    );

    console.log(result)
  }, 60000); // 30 second timeout for blockchain operations
});
