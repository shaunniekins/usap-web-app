import { supabase } from "../../../supabase";

export const sendMessageData = async (rowData) => {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .insert([rowData])
      .select("*");

    if (error) {
      // console.error("Error inserting data:", error);
      return { data: null, error };
    } else {
      // console.log("Successfully inserted data:", data);
      return { data, error: null };
    }
  } catch (error) {
    // console.error("An error occurred:", error);
    return { data: null, error };
  }
};
