"use client";

import { useState, useEffect } from "react";

import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { TbHeartHandshake } from "react-icons/tb";
import Navbar from "./Navbar";

const SearchingText = () => {
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
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <p className=" text-gray-400 text-lg mb-[130px]">Searching{dots}</p>;
};

const Main = () => {
  //colors:
  // 5E17EB, 8C52FF
  const [isSearchActivated, setSearchActivated] = useState(false);
  const [matchFound, setMatchFound] = useState(false);

  return (
    <div className="w-screen h-screen flex flex-col items-center font-Roboto">
      {!isSearchActivated ? (
        <Navbar />
      ) : (
        <button
          className="self-start m-5 font-mono text-xl rounded-full"
          onClick={() => setSearchActivated(false)}>
          X
        </button>
      )}
      <div className="w-full h-full flex flex-col items-center justify-center">
        <button
          className={`heart bg-[#8C52FF] rounded-full p-5 ${
            isSearchActivated ? "pulse morph-active" : "morph"
          }`}
          onClick={() => setSearchActivated(true)}>
          <TbHeartHandshake size={175} color="white" />
        </button>
      </div>
      {!isSearchActivated ? (
        <p className=" text-gray-400 text-sm mt-[-60px] mb-[130px]">
          Tap Heart to start
        </p>
      ) : (
        <SearchingText />
      )}
    </div>
  );
};

export default Main;
