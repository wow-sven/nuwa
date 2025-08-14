import { CapKit } from "../src/index";
import { describe, it } from '@jest/globals';
import {setupEnv} from "./setup";

describe("CapKit", () => {
  let capKit: CapKit;
  beforeAll(async () => {
    const { capKit: a } = await setupEnv();
    capKit = a;
  })

  it("should query cap by id", async () => {
    const result = await capKit.queryCapWithCID('QmdirjyLVKQUo2xYsTSkWAfoPmnwdp8wn4W7Z8SW4V4LEy')

    console.log(result)
  }, 150000);
});
