// chat_sessions.js
import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabase";
import { fetchUserProfileData } from "./user_profiles";

export const useRealTimeSession = (localUsername) => {
  const [sessions, setSessions] = useState([]);
  const [user_id, setUser_id] = useState("");

  useEffect(() => {
    const checkMatch = async () => {
      const { data: fetchUserNameData } = await fetchUserProfileData();
      const userData = fetchUserNameData.find(
        (item) => item.user_name === localUsername
      );

      if (userData) {
        setUser_id(userData.user_id);
      }
    };
    checkMatch();
    const interval = setInterval(checkMatch, 4000);

    return () => clearInterval(interval);
  }, [localUsername]);

  useEffect(() => {
    async function fetchInitialData() {
      if (user_id) {
        // Ensure user_id exists before making the query
        try {
          const { data, error } = await supabase
            .from("chat_sessions")
            .select()
            .or(`user1.eq.${user_id}`, `user2.eq.${user_id}`);

          if (error) {
            console.error("Error fetching data:", error);
          } else {
            setSessions(data);
          }
        } catch (error) {
          console.error("An error occurred:", error);
        }
      }
    }

    fetchInitialData();

    const channel = supabase
      .channel("realtime sessions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "PUBLIC", table: "chat_sessions" },
        (payload) => {
          setSessions((prevSessions) => [...prevSessions, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user_id]);

  return sessions;
};

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

export const updateChatSessionData = async (rowId, updateData) => {
  try {
    const { data, error } = await supabase
      .from("chat_sessions")
      .update(updateData)
      .eq("id", rowId)
      .select("*");

    if (error) {
      console.error("Error updating data:", error);
      return { data: null, error };
    } else {
      console.log("Successfully updated data:", data);
      return { data, error: null };
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return { data: null, error };
  }
};

export const deleteChatSessionData = async (rowId) => {
  try {
    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", rowId);
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
