import { BsArrowReturnRight } from "react-icons/bs";
import { IoExitOutline } from "react-icons/io5";
import { AiFillCloseCircle } from "react-icons/ai";
import { useEffect, useState } from "react";
import { updateChatSessionData } from "../data/chat_sessions";
import UpdateSession from "../tools/session/updateSession";
import { supabase } from "../../../supabase";
import { sendMessageData } from "../data/convo";

const SentMessage = ({ msg }) => {
  return (
    <div className="rounded-full self-end py-1 px-3 text-white bg-[#8C52FF]">
      <p>{msg}</p>
    </div>
  );
};

const ReceiveMessage = ({ msg }) => {
  return (
    <div className="rounded-full self-start py-1 px-3 text-white bg-gray-500">
      <p>{msg}</p>
    </div>
  );
};

const Conversation = ({
  session,
  userID,
  setIsMatchFound,
  handleSearchDeactivate,
}) => {
  // UpdateUserSearching(false);
  handleSearchDeactivate();

  const [inputtedMsg, setInputtedMsg] = useState("");
  const [sessionMsg, setSessionMsg] = useState([]);

  let rowId = session.id;
  // const [rowId, setRowId] = useState(session.id);
  // console.log("rowId", rowId);

  // what column in the db table user is present
  let col_present;

  let connected_user;
  const personalID = userID;
  if (personalID !== session.user1) {
    connected_user = session.user1;
    col_present = 2;
  } else {
    connected_user = session.user2;
    col_present = 1;
  }

  let updateData;
  if (col_present === 1) {
    updateData = {
      user1_isConnected: false,
    };
  } else if (col_present === 2) {
    updateData = {
      user2_isConnected: false,
    };
  }

  // console.log("personalID", personalID);

  // when user leave or reloads browser
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Perform actions before the component unloads
      event.preventDefault();
      event.returnValue = "";
      UpdateSession(rowId, updateData);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // chat
  useEffect(() => {
    async function fetchInitialChatData() {
      try {
        const { data, error } = await supabase
          .from("conversations")
          .select()
          .eq("session_id", rowId);

        if (error) {
          console.error("Error fetching data:", error);
        } else {
          if (data && data.length > 0) {
            setSessionMsg(data);
          }
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
    fetchInitialChatData();

    const channel = supabase
      .channel("realtime messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversations" },
        (payload) => {
          setSessionMsg((prevMsg) => [...prevMsg, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  let hasPrinted = false;

  useEffect(() => {
    if (sessionMsg && sessionMsg.length !== 0 && !hasPrinted) {
      // setIsMatchFound(true);
      // console.log("sessionMsg", sessionMsg);

      hasPrinted = true;
    }
  }, [sessionMsg]);

  const handleMessageChange = (e) => {
    setInputtedMsg(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const rowData = {
      session_id: rowId,
      sender: personalID,
      message: inputtedMsg,
    };

    await sendMessageData(rowData);
    setInputtedMsg("");
  };

  const handleEndConvo = async () => {
    let exit = confirm("Are you sure you want to end this conversation?");

    if (exit) {
      UpdateSession(rowId, updateData);
      handleSearchDeactivate();
      setIsMatchFound(false);
    }
  };

  return (
    <div className="w-screen h-[100dvh] flex flex-col items-center">
      <div className="w-full py-4 px-3 border-b-2 shadow-2xl flex items-center justify-between">
        <IoExitOutline color="white" size={25} />

        <div className="flex flex-col items-center">
          <p className="text-xs text-gray-400">You are chatting with</p>
          <p className="text-md font-medium">{connected_user}</p>
        </div>
        <button onClick={handleEndConvo}>
          <IoExitOutline color="purple" size={25} />
        </button>
      </div>

      <div className="convo-area bg-gray-100 w-full h-full px-3 pb-5 flex flex-col justify-end space-y-2 overflow-y-auto">
        <p className="self-center1 text-center text-xs text-gray-400 pb-3">
          You can now message. Say {`"Hi!"`}
        </p>
        {sessionMsg.map((message, index) => {
          const isSentMessage = message.sender === personalID;
          const msgComponent = isSentMessage ? (
            <SentMessage msg={message.message} key={index} />
          ) : (
            <ReceiveMessage msg={message.message} key={index} />
          );
          return msgComponent;
        })}
      </div>

      <div className="chat w-full py-3 px-3 flex space-x-3 bg-white">
        <textarea
          name="message"
          id="message"
          rows="1"
          value={inputtedMsg}
          onChange={handleMessageChange}
          placeholder="Type Message"
          className="w-full border-none outline-none rounded-full pl-3 py-2 bg-gray-200 flex items-center"></textarea>
        <button
          className={`rounded-full p-3 ${
            inputtedMsg === "" ? "bg-gray-500" : "bg-[#8C52FF]"
          }`}
          disabled={inputtedMsg === ""}
          onClick={handleSendMessage}>
          <BsArrowReturnRight color="white" />
        </button>
      </div>
    </div>
  );
};

export default Conversation;
