import React from "react";
import { Block } from "./Block";
import {
  FiDollarSign,
  FiActivity,
  FiZap,
  FiAward,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import { IconType } from "react-icons";
import { twMerge } from "tailwind-merge";
import { CardTitle } from "./CardTitle";
import { CardSubtitle } from "./CardSubtitle";

export const HighlighBlocks = () => {
  return (
    <>
      <HighlightBlock
        Icon={FiDollarSign}
        iconClassName="text-green-500"
        title="No Setup Cost"
        subtitle="Nuwa offers out-of-the-box solution, eliminating the need for setup costs."
      />
      <HighlightBlock
        Icon={FiActivity}
        iconClassName="text-purple-500"
        title="Usage-Based Pricing"
        subtitle="Only pay when users interact with your agent, eliminating maintenance costs and ensuring ROI on every transaction."
      />
      <HighlightBlock
        Icon={FiZap}
        iconClassName="text-orange-500"
        title="Enhanced Functionality"
        subtitle="Unlock new product capabilities that would be difficult to implement through traditional user interfaces."
      />
      <HighlightBlock
        Icon={FiAward}
        iconClassName="text-pink-500"
        title="Brand Control"
        subtitle="Maintain your unique branding and user experience."
      />
      <HighlightBlock
        Icon={FiUserCheck}
        iconClassName="text-blue-500"
        title="User Sovereignty"
        subtitle="Keep valuable user interaction within your ecosystem."
      />
      <HighlightBlock
        Icon={FiUsers}
        iconClassName="text-zinc-500"
        title="Expanded User Base"
        subtitle="A shared user base with Nuwa can expand your user base on the day-1 of your agent launch."
      />

    </>
  );
};

type Props = {
  Icon: IconType;
  iconClassName: string;
  title: string;
  subtitle: string;
};

const HighlightBlock = ({ iconClassName, Icon, title, subtitle }: Props) => (
  <Block className="col-span-3 space-y-1.5 md:col-span-1">
    <Icon className={twMerge("text-3xl text-indigo-600", iconClassName)} />
    <CardTitle>{title}</CardTitle>
    <CardSubtitle>{subtitle}</CardSubtitle>
  </Block>
);
