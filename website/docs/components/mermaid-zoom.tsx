"use client";

import { useEffect } from "react";

export default function MermaidZoomEnhancerClient() {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      document.querySelectorAll("div > svg").forEach((svg) => {
        const parentDiv = svg.parentElement;
        if (
          !parentDiv ||
          parentDiv.getAttribute("data-zoom-processed") === "true"
        ) {
          return;
        }

        const handleClick = () => {
          const overlay = document.createElement("div");
          overlay.className =
            "fixed inset-0 w-screen h-screen bg-black/80 flex items-center justify-center z-[9999]";

          // 内容包裹层
          const content = document.createElement("div");
          content.setAttribute("data-zoom-processed", "true");
          content.className =
            "relative z-2 flex flex-col items-center justify-center w-[80vw] h-[80vh] bg-white rounded-lg shadow-[0_4px_32px_rgba(0,0,0,0.3)]";

          // SVG
          const clone = svg.cloneNode(true) as SVGElement;
          clone.setAttribute("class", "min-w-full min-h-full p-10");

          // 组装
          content.appendChild(clone);
          overlay.appendChild(content);

          // 只点击 overlay 背景时关闭
          overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
              document.body.removeChild(overlay);
            }
          });

          document.body.appendChild(overlay);
        };

        parentDiv.setAttribute("data-zoom-processed", "true");

        parentDiv.addEventListener("click", handleClick);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
