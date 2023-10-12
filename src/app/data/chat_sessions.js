import { supabase } from "../../../supabase";

export const fetchChatSessionData = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select()
      .or(`user1.eq.${user_id}`, `user2.eq.${user_id}`);

    if (error) {
      console.error("Error fetching data:", error);
      return { data: [], error };
    } else {
      console.log("Data:", data);
      return { data, error: null };
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return { data: [], error };
  }
};
