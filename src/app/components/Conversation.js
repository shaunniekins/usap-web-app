import { BsArrowReturnRight } from "react-icons/bs";
import { IoExitOutline } from "react-icons/io5";
import { AiFillCloseCircle } from "react-icons/ai";
import { useEffect, useState } from "react";

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

const Conversation = ({ setIsMatchFound }) => {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Perform actions before the component unloads
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleEndConvo = () => {
    let exit = confirm("Are you sure you want to end this conversation?");

    exit && setIsMatchFound(false);
  };

  return (
    <div className="w-screen h-[100dvh] flex flex-col items-center">
      <div className="w-full py-4 px-3 border-b-2 shadow-2xl flex items-center justify-between">
        <IoExitOutline color="white" size={25} />

        <div className="flex flex-col items-center">
          <p className="text-xs text-gray-400">You are chatting with</p>
          <p className="text-md font-medium">shaunniekins123</p>
        </div>
        <button onClick={handleEndConvo}>
          <IoExitOutline color="purple" size={25} />
        </button>
      </div>

      <div className="convo-area bg-gray-100 w-full h-full px-3 pb-5 flex flex-col-reverse justify-start space-y-2 overflow-y-auto">
        <SentMessage msg={"hi"} />
        <ReceiveMessage msg={"wassup"} />
        <SentMessage msg={"hello"} />
        <SentMessage msg={"hi"} />
        <p className="self-center1 text-center text-xs text-gray-400 pb-3">
          You can now message. Say {`"Hi!"`}
        </p>
      </div>

      <div className="chat w-full py-3 px-3 flex space-x-3 bg-white">
        <textarea
          name="message"
          id="message"
          rows="1"
          placeholder="Type Message"
          className="w-full border-none outline-none rounded-full pl-3 py-2 bg-gray-200 flex items-center"></textarea>
        <button className="rounded-full p-3 bg-[#8C52FF]">
          <BsArrowReturnRight color="white" />
        </button>
      </div>
    </div>
  );
};

export default Conversation;
