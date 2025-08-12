import { CapKit } from "../src/index";
import { describe, it } from '@jest/globals';
import {setupEnv} from "./setup";

describe("CapKit", () => {
  let capKit: CapKit;
  beforeAll(async () => {
    const { capKit: a } = await setupEnv();
    capKit = a;
  })

  it("should query cap by name", async () => {
    // const cid = await capKit.registerCap(
    //   "test_cap",
    //   "test_cap",
    //   {}
    // );

    // await new Promise(resolve => setTimeout(resolve, 35000));
    const all = await capKit.queryWithName()

    const result = await capKit.queryWithName('test')

    const resut1 = await capKit.queryWithName(undefined, ['Coding'])

    console.log(all)
    console.log(result)
    console.log(resut1)
  }, 150000);
});
