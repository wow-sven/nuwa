"use client";

import { useState } from "react";

interface BlogFilterProps {
  tags: string[];
  onFilterChange: (filteredPosts: any[]) => void;
  posts: any[];
}

// 动态生成标签数据
const generateTabData = (tags: string[]) => {
  return [
    { id: 1, title: "All" },
    ...tags.map((tag, index) => ({ id: index + 2, title: tag })),
  ];
};

const BlogFilter = ({ tags, onFilterChange, posts }: BlogFilterProps) => {
  const [filterId, setFilterId] = useState(1);
  const tabData = generateTabData(tags);

  const handleFilterChange = (id: number) => {
    setFilterId(id);
    const filteredPosts =
      id === 1
        ? posts
        : posts.filter((post) => {
            const filterTag = tabData.find((tab) => tab.id === id)?.title;
            return filterTag ? post.tag === filterTag : false;
          });
    onFilterChange(filteredPosts);
  };

  return (
    <div className="mx-auto grid w-full grid-cols-2 gap-4 py-6 lg:grid-cols-4">
      {tabData.map((t) => (
        <ToggleButton
          key={t.id}
          id={t.id}
          selected={filterId}
          setSelected={handleFilterChange}
        >
          {t.title}
        </ToggleButton>
      ))}
    </div>
  );
};

interface ToggleButtonProps {
  children: React.ReactNode;
  selected: number;
  setSelected: (id: number) => void;
  id: number;
}

const ToggleButton = ({
  children,
  selected,
  setSelected,
  id,
}: ToggleButtonProps) => {
  return (
    <div
      className={`rounded-lg transition-colors ${
        selected === id ? "bg-purple-600" : "bg-slate-900 dark:bg-slate-200"
      }`}
    >
      <button
        onClick={() => setSelected(id)}
        className={`w-full origin-top-left rounded-lg border py-3 text-xs font-medium transition-all md:text-base ${
          selected === id
            ? "-translate-y-1 border-purple-600 bg-white text-purple-600"
            : "border-slate-900 bg-white text-slate-900 hover:-rotate-2"
        }`}
      >
        {children}
      </button>
    </div>
  );
};

export default BlogFilter;
