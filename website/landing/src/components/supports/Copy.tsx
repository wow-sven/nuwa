import React, { Dispatch, SetStateAction } from "react";
import { CheckPill } from "./CheckPill";
import { OPTIONS } from "./options";

export const Copy = ({
  selected,
  setSelected,
}: {
  selected: number;
  setSelected: Dispatch<SetStateAction<number>>;
}) => {
  return (
    <div className="w-full">
      <span className="mb-1.5 block text-center text-indigo-600 md:text-start">
        Usecases
      </span>
      <h2 className="mb-3 text-center text-4xl font-bold leading-tight md:text-start md:text-5xl md:leading-tight">
        Transform your Web3 products, big or small
      </h2>
      <p className="mb-6 text-center text-base leading-relaxed md:text-start md:text-lg md:leading-relaxed">
        The AI revolution is here, and your Web3 protocol can't afford to be left behind. Without intuitive agent interfaces, you'll watch the next billion users slip through your fingers. Let Nuwa transform your complex blockchain technology into seamless conversations that new users instantly understand—positioning your protocol at the forefront of tomorrow's AI-native world.
      </p>
      <div className="mb-6 flex flex-wrap justify-center gap-3 md:justify-start">
        {OPTIONS.map((o, i) => {
          return (
            <CheckPill
              key={o.title}
              index={i}
              selected={i === selected}
              setSelected={setSelected}
            >
              {o.title}
            </CheckPill>
          );
        })}
      </div>
    </div>
  );
};
