import { BsArrowReturnRight } from "react-icons/bs";
import { IoExitOutline } from "react-icons/io5";
import { AiFillCloseCircle } from "react-icons/ai";
import { useEffect, useState } from "react";
import { updateChatSessionData } from "../data/chat_sessions";
import UpdateSession from "../tools/session/updateSession";
import { supabase } from "../../../supabase";
import { sendMessageData } from "../data/convo";
import { fetchUserProfileData } from "../data/user_profiles";

const SentMessage = ({ msg }) => {
  return (
    <div className="rounded-3xl self-end py-1 px-3 text-white bg-[#8C52FF]">
      <p dangerouslySetInnerHTML={{ __html: msg }}></p>
    </div>
  );
};

const ReceiveMessage = ({ msg }) => {
  return (
    <div className="rounded-3xl self-start py-1 px-3 text-white bg-gray-500">
      <p dangerouslySetInnerHTML={{ __html: msg }}></p>
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
  const [connectedUserName, setConnectedUserName] = useState("");
  const [updatedConnection, setUpdatedConnection] = useState([]);
  const [connectionOfConnectedUser, setConnectionOfConnectedUser] =
    useState(true);

  let rowId = session.id;
  // const [rowId, setRowId] = useState(session.id);
  // console.log("rowId", rowId);

  // what column in the db table user is present
  let col_present;

  let connected_user = "";
  const personalID = userID;
  if (personalID !== session.user1) {
    connected_user = session.user1;
    col_present = 2;
  } else {
    connected_user = session.user2;
    col_present = 1;
  }

  let updateData;
  let connected_user_col;
  if (col_present === 1) {
    updateData = {
      user1_isConnected: false,
    };
    connected_user_col = "user2";
  } else if (col_present === 2) {
    updateData = {
      user2_isConnected: false,
    };
    connected_user_col = "user2";
  }

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

  const checkConnectedUsername = async () => {
    const { data: fetchUserNameData } = await fetchUserProfileData();
    const userData = fetchUserNameData.find(
      (item) => item.user_id === connected_user
    );

    if (userData) {
      setConnectedUserName(userData.user_name);
      // console.log("connectedUserName", connectedUserName);
    }
  };

  useEffect(() => {
    if (connected_user) checkConnectedUsername();
  }, [connected_user]);

  // console.log("connected_user", connected_user);
  // console.log("connected_user_col", connected_user_col);

  // check update to the connectivity of the connected user
  useEffect(() => {
    async function fetchUpdateUserConnectionData() {
      try {
        const { data, error } = await supabase
          .from("chat_sessions")
          .select()
          .eq(connected_user_col, connected_user);

        if (error) {
          console.error("Error fetching data (update): ", error);
        } else {
          setUpdatedConnection(data);
        }
      } catch (error) {
        console.error("An error occurred (update):", error);
      }
    }

    fetchUpdateUserConnectionData();

    const channel = supabase
      .channel("realtime sessions")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_sessions" },
        (payload) => {
          setUpdatedConnection(payload.new);
          updateConnectionOfConnectedUser(payload.new);
        }
      )
      .subscribe();

    const updateConnectionOfConnectedUser = (updatedData) => {
      if (connected_user_col === 1) {
        setConnectionOfConnectedUser(updatedData.user1_isConnected);
      } else {
        setConnectionOfConnectedUser(updatedData.user2_isConnected);
      }
    };

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // console.log("connectionOfConnectedUser ", connectionOfConnectedUser);

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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Replace new lines with <br /> tags
    const messageWithLineBreaks = inputtedMsg.replace(/\n/g, "<br />");

    const rowData = {
      session_id: rowId,
      sender: personalID,
      message: messageWithLineBreaks,
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
        {!connectionOfConnectedUser ? (
          <div className="flex flex-col items-center">
            <p className="text-md font-medium">{connectedUserName}</p>
            <p className="text-xs text-red-400">Disconnected</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-400">You are chatting with</p>
            <p className="text-md font-medium">{connectedUserName}</p>
          </div>
        )}
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
          // Replace <br /> with new line characters when displaying
          const msg = message.message;
          // console.log("msg: ", message.message);

          const msgComponent = isSentMessage ? (
            <SentMessage msg={msg} key={index} />
          ) : (
            <ReceiveMessage msg={msg} key={index} />
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
          onKeyDown={handleKeyPress}
          disabled={!connectionOfConnectedUser}
          placeholder="Type Message"
          className="w-full border-none outline-none rounded-full pl-3 resize-none py-2 bg-gray-200 flex items-center"></textarea>
        <button
          className={`rounded-full p-3 ${
            inputtedMsg.trim() === "" || !connectionOfConnectedUser
              ? "bg-gray-500"
              : "bg-[#8C52FF]"
          }`}
          disabled={inputtedMsg.trim() === "" || !connectionOfConnectedUser}
          onClick={handleSendMessage}>
          <BsArrowReturnRight color="white" />
        </button>
      </div>
    </div>
  );
};

export default Conversation;
