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
  // 5E17EB (dark), 8C52FF (light)
  const [isSearchActivated, setSearchActivated] = useState(false);
  const [matchFound, setMatchFound] = useState(false);

  return (
    <div className="w-screen h-[100dvh] flex flex-col items-center font-Roboto">
      {!isSearchActivated ? (
        <Navbar />
      ) : (
        <button
          className="self-start m-5 text-xs text-gray-400 rounded-full z-30"
          onClick={() => setSearchActivated(false)}>
          Cancel
        </button>
      )}
      <div className="w-full h-full mt-[-100px] flex items-center justify-center relative">
        {isSearchActivated ? (
          <>
            <div className="circle2 pulseCircle2 w-[600px] h-[600px] z-0 absolute bg-purple-400 rounded-full" />
            <div className="circle1 pulseCircle1 w-[400px] h-[400px] z-10 absolute bg-purple-300 rounded-full" />
          </>
        ) : null}

        <button
          className={`heart bg-[#8C52FF] rounded-full p-5 ${
            isSearchActivated ? "pulse morph-active" : "morph"
          } relative z-20`}
          onClick={() => setSearchActivated(true)}>
          <AiFillHeart size={isSearchActivated ? 175 : 185} color="white" />
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
