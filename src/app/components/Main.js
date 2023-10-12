"use client";

import { useState, useEffect } from "react";

import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { BsArrowReturnRight } from "react-icons/bs";
import { TbHeartHandshake } from "react-icons/tb";
import Navbar from "./Navbar";
import Conversation from "./Conversation";

import RegisterUser from "../tools/registerUser";
import UpdateUserSearching from "../tools/updateUserSearching";
import DeleteUser from "../tools/deleteUser";
// import checkMatch from "../tools/checkMatch";

import { fetchUserProfileData } from "../data/user_profiles";
import { fetchChatSessionData } from "../data/chat_sessions";
import { getLocalStorageItem } from "../tools/localStorage";

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
  const [isMatchFound, setIsMatchFound] = useState(false);
  const [chatData, setChatData] = useState([]);

  const checkMatch = async () => {
    const user_name = getLocalStorageItem("user_name");
    const { data: fetchUserNameData } = await fetchUserProfileData();

    const userData = fetchUserNameData.find(
      (item) => item.user_name === user_name
    );

    if (userData) {
      const user_id = userData.user_id;
      try {
        let session_data = await fetchChatSessionData(user_id);
        setChatData(session_data);
        console.log("chatData", chatData);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  useEffect(() => {
    checkMatch();

    const interval = setInterval(checkMatch, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
      DeleteUser();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleSearchActivate = () => {
    setSearchActivated(true);
    RegisterUser();
  };

  const handleSearchDeactivate = () => {
    setSearchActivated(false);
    UpdateUserSearching(false);
  };

  return (
    <div className="w-screen h-[100dvh] flex flex-col items-center font-Roboto overflow-hidden ">
      {!isSearchActivated && !isMatchFound ? (
        <Navbar />
      ) : (
        isSearchActivated &&
        !isMatchFound && (
          <button
            className="self-start m-5 text-xs text-gray-400 rounded-full z-30"
            onClick={handleSearchDeactivate}>
            Cancel
          </button>
        )
      )}
      {!isMatchFound ? (
        <div className="w-full h-full flex flex-col items-center">
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
              onClick={handleSearchActivate}
              disabled={isSearchActivated}>
              <AiFillHeart size={isSearchActivated ? 185 : 130} color="white" />
            </button>
          </div>

          {!isSearchActivated ? (
            <p className=" text-gray-400 text-sm mt-[-100px] mb-[100px]">
              Tap Heart to start
            </p>
          ) : (
            <SearchingText />
          )}
        </div>
      ) : (
        <Conversation setIsMatchFound={setIsMatchFound} />
      )}
    </div>
  );
};

export default Main;
