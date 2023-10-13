import { deleteChatSessionData } from "@/app/data/chat_sessions";

const DeleteSession = async (rowId) => {
  await deleteChatSessionData(rowId);
};

export default UpdateSession;
