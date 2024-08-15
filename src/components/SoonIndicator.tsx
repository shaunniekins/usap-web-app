"use client";

import { useEffect, useState } from "react";

const SoonIndicatorSoon = () => {
  const [text, setText] = useState("");
  const fullText = "S O O N";

  useEffect(() => {
    const interval = setInterval(() => {
      setText((prevText) => {
        if (prevText === fullText) {
          return "";
        } else {
          return fullText.slice(0, prevText.length + 1);
        }
      });
    }, 300);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <div className="text-xl font-semibold h-5">{text}</div>;
};

export default SoonIndicatorSoon;
