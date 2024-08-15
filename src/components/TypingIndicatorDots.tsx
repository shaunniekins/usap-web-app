"use client";

import { useEffect, useState } from "react";

const TypingIndicatorDots = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => {
        if (prevDots === "...") {
          return "";
        } else {
          return prevDots + ".";
        }
      });
    }, 300);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <div className="text-gray-400 text-3xl h-10 pl-2">{dots}</div>;
};

export default TypingIndicatorDots;
