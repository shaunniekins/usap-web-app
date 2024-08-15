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

  return <p className="text-gray-400 text-lg h-8 pl-2">{dots}</p>;
};

export default TypingIndicatorDots;
