"use client";

import { useState, useEffect } from "react";

import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { BsArrowReturnRight } from "react-icons/bs";
import { TbHeartHandshake } from "react-icons/tb";
import Navbar from "./Navbar";
import Conversation from "./Conversation";

import RegisterUser from "../tools/user/registerUser";
import UpdateUserSearching from "../tools/user/updateUserSearching";
import DeleteUser from "../tools/user/deleteUser";
// import checkMatch from "../tools/checkMatch";

import { fetchUserProfileData } from "../data/user_profiles";
import { supabase } from "../../../utils/supabase";

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

  return <p>Searching{dots}</p>;
};

const Main = () => {
  //colors:
  // 5E17EB (dark), 8C52FF (light)
  const [isSearchActivated, setSearchActivated] = useState(false);
  const [isMatchFound, setIsMatchFound] = useState(false);
  const [localUsername, setLocalUsername] = useState("");
  const [sessions, setSessions] = useState([]);
  const [user_id, setUser_id] = useState("");

  // for Conversation component
  const [rowId, setRowId] = useState(null);
  const [personalColumnLocation, setPersonalColumnLocation] = useState(null);
  const [partnerColumnLocation, setPartnerColumnLocation] = useState(null);
  const [partnerID, setPartnerID] = useState("");
  const [updateData, setUpdateData] = useState(null);
  const [personalID, setPersonalID] = useState(null);

  // when user leave or reloads browser
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

  // retrieval of current user id using local username
  const checkMatch = async () => {
    const { data: fetchUserNameData } = await fetchUserProfileData();
    const userData = fetchUserNameData.find(
      (item) => item.user_name === localUsername
    );

    if (userData) {
      setUser_id(userData.user_id);
    }
  };

  // call checkMatch full if localUsername will have a value
  useEffect(() => {
    if (localUsername) {
      checkMatch();
    }
  }, [localUsername]);

  useEffect(() => {
    // console.log("Entering useEffect");
    async function fetchInitialData() {
      if (user_id) {
        // console.log("user_id", user_id);
        try {
          const { data, error } = await supabase
            .from("chat_sessions")
            .select()
            .or(`user1.eq.${user_id}`, `user2.eq.${user_id}`)
            .filter(`user1_isConnected`, `eq`, `true`)
            .filter(`user2_isConnected`, `eq`, `true`);

          if (error) {
            console.error("Error fetching data:", error);
          } else {
            if (data && data.length > 0) {
              if (
                (data.user1 === user_id && data.user1_isConnected === true) ||
                (data.user2 === user_id && data.user2_isConnected === true)
              ) {
                setSessions(data);
              }
            }
          }
        } catch (error) {
          console.error("An error occurred:", error);
        }
      }
    }

    fetchInitialData();
  }, [user_id]);

  useEffect(() => {
    // const intervalId = setInterval(() => {
    const channel = supabase
      .channel(`${sessions.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_sessions",
          // filter: "user1_isConnected=eq.true",
          // filter: "user2_isConnected=eq.true",
        },
        (payload) => {
          // Replace the entire sessions state with the new data
          if (
            (payload.new.user1 === user_id &&
              payload.new.user1_isConnected === true) ||
            (payload.new.user2 === user_id &&
              payload.new.user2_isConnected === true)
          ) {
            setSessions(payload.new);
            // setSessions((prevSessions) => [...prevSessions, payload.new]);
          } else {
            console.log("no data");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // }, 3000);
    // return () => clearInterval(intervalId); //This is important

    // supabase or sessions
  }, [user_id, supabase]);
  console.log("sessions", sessions);

  // let hasPrinted = false;
  useEffect(() => {
    if (sessions && sessions.length !== 0 && !isMatchFound) {
      setRowId(sessions.id);
      setPersonalID(user_id);

      if (user_id && sessions.user1 && sessions.user2) {
        if (user_id === sessions.user1) {
          setPersonalColumnLocation(1);
          setUpdateData({
            user1_isConnected: false,
          });
          setPartnerID(sessions.user2);
          setPartnerColumnLocation("user2");
        } else if (user_id === sessions.user2) {
          setPersonalColumnLocation(2);
          setUpdateData({
            user2_isConnected: false,
          });
          setPartnerID(sessions.user1);
          setPartnerColumnLocation("user1");
        }
        setIsMatchFound(true);
        // hasPrinted = true;
      }
    }
  }, [sessions]);

  const handleSearchActivate = async () => {
    const username = await RegisterUser();
    setLocalUsername(username);
    UpdateUserSearching(true);
    setSearchActivated(true);
  };

  const handleSearchDeactivate = () => {
    UpdateUserSearching(false);
    setSearchActivated(false);
  };

  return (
    <div className="w-screen h-[100dvh] flex flex-col font-Roboto overflow-hidden">
      {!isSearchActivated && !isMatchFound ? (
        <div className=" top-0 absolute">
          <Navbar />
        </div>
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
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="w-full h-full flex items-center justify-center relative">
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
            <p className=" text-gray-400 text-sm bottom-16 absolute">
              Tap to start
            </p>
          ) : (
            <div className=" text-gray-400 text-lg mb-[100px]">
              <SearchingText />
            </div>
          )}
        </div>
      ) : (
        <Conversation
          rowId={rowId}
          session={sessions}
          localUsername={localUsername}
          personalColumnLocation={personalColumnLocation}
          partnerColumnLocation={partnerColumnLocation}
          partnerID={partnerID}
          personalID={personalID}
          updateData={updateData}
          setIsMatchFound={setIsMatchFound}
          handleSearchDeactivate={handleSearchDeactivate}
        />
      )}
    </div>
  );
};

export default Main;
