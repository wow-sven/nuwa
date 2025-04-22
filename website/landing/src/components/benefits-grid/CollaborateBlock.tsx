import React from "react";
import { BsFillCursorFill } from "react-icons/bs";
import { Block } from "./Block";
import { twMerge } from "tailwind-merge";
import { CardTitle } from "./CardTitle";
import { CardSubtitle } from "./CardSubtitle";

export const CollaborateBlock = () => (
  <Block className="col-span-3 overflow-hidden md:col-span-1">
    <div className="flex h-full flex-col justify-between gap-6">
      <div className="relative -mx-6 -mt-6 grid h-full place-content-center overflow-hidden border-b-2 border-zinc-900 bg-zinc-100 shadow-inner shadow-zinc-500">
        <img
          src="https://api.dicebear.com/8.x/shapes/svg?seed=A2SC"
          alt="Collaboration illustration"
          className="mx-auto h-48 w-48"
        />
      </div>
      <div>
        <CardTitle>Security Governance</CardTitle>
        <CardSubtitle>
          Implement precise control over transaction security and permissions.
        </CardSubtitle>
      </div>
    </div>
  </Block>
);

type CursorProps = {
  wrapperClassName?: string;
  cursorClassName?: string;
  nameClassName?: string;
  nameText: string;
};

const Cursor = ({
  wrapperClassName,
  cursorClassName,
  nameClassName,
  nameText,
}: CursorProps) => {
  return (
    <div className={twMerge("absolute left-[60%] top-[60%]", wrapperClassName)}>
      <BsFillCursorFill
        className={twMerge(
          "-rotate-90 text-4xl text-pink-500",
          cursorClassName
        )}
      />
      <span
        className={twMerge(
          "block translate-x-1/2 whitespace-nowrap rounded border border-pink-900 bg-pink-200 px-1.5 py-0.5 text-xs text-pink-900",
          nameClassName
        )}
      >
        {nameText}
      </span>
    </div>
  );
};
