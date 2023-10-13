import { updateChatSessionData } from "@/app/data/chat_sessions";

const UpdateSession = async (rowId, updateData) => {
  await updateChatSessionData(rowId, updateData);
};

export default UpdateSession;
