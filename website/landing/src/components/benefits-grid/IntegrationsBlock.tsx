import React from "react";
import {
  SiEthereum,
  SiBitcoin,
  SiBinance,
  SiPolygon,
  SiSolana,
} from "react-icons/si";
import { Block } from "./Block";
import { CardTitle } from "./CardTitle";
import { CardSubtitle } from "./CardSubtitle";

export const IntegrationsBlock = () => (
  <Block className="col-span-3 overflow-hidden md:col-span-2">
    <CardTitle>Integrate with Web3 Protocols Across All Chains</CardTitle>
    <CardSubtitle>
      Nuwa is designed to integrate seamlessly with all Web3 products and protocols across all chains, ensuring a smooth and secure experience for users.
    </CardSubtitle>

    <div className="relative -mx-6 -mb-6 mt-6 grid grid-cols-3 place-content-center rounded-t-none border-t-2 border-zinc-900">
      <div className="grid w-full place-content-center border-r-2 border-zinc-900 bg-[#627EEA] py-8 text-white">
        <SiEthereum className="text-4xl" />
      </div>
      <div className="grid w-full place-content-center border-r-2 border-zinc-900 bg-[#F7931A] py-8 text-white">
        <SiBitcoin className="text-4xl" />
      </div>
      <div className="grid w-full place-content-center bg-[#F3BA2F] py-8 text-white">
        <SiBinance className="text-4xl" />
      </div>

      <div className="grid w-full place-content-center border-r-2 border-t-2 border-zinc-900 bg-[#8247E5] py-8 text-white">
        <SiPolygon className="text-4xl" />
      </div>
      <div className="grid w-full place-content-center border-r-2 border-t-2 border-zinc-900 bg-[#14F195] py-8 text-black">
        <SiSolana className="text-4xl" />
      </div>
      <div className="grid w-full place-content-center border-t-2 border-zinc-900 bg-white py-8">
        +50's more
      </div>
    </div>
  </Block>
);
