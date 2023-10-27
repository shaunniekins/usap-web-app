import { supabase } from "../../../utils/supabase";

export const fetchUserProfileData = async () => {
  try {
    const { data, error } = await supabase.from("user_profiles").select("*");

    if (error) {
      // console.error("Error fetching data:", error);
      return { data: [], error };
    } else {
      // console.log("Data:", data);
      return { data, error: null };
    }
  } catch (error) {
    // console.error("An error occurred:", error);
    return { data: [], error };
  }
};

export const fetchUserProfileUserNameData = async () => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("user_name");

    if (error) {
      //   console.error("Error fetching data:", error);
      return { data: [], error };
    } else {
      //   console.log("Data:", data);
      return { data, error: null };
    }
  } catch (error) {
    // console.error("An error occurred:", error);
    return { data: [], error };
  }
};

export const insertUserProfileData = async (rowData) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
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

export const updateUserProfileData = async (user_name, updateData) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("user_name", user_name)
      .select("*");

    if (error) {
      console.error("Error updating user profile data:", error);
      return { data: null, error };
    } else {
      // console.log("Successfully updating user profile data:", data);
      return { data, error: null };
    }
  } catch (error) {
    console.error("An error updating user profile occurred:", error);
    return { data: null, error };
  }
};

export const deleteUserProfileData = async (user_name) => {
  try {
    const { error } = await supabase
      .from("user_profiles")
      .delete()
      .eq("user_name", user_name);
    if (error) {
      console.error("Error deleting data:", error);
      return { data: null, error };
    } else {
      console.log("Successfully deleted data:", data);
      return { data, error: null };
    }
  } catch (error) {
    // console.error("An error occurred:", error);
    return { data: null, error };
  }
};
