// src/utils/searchService.tsx

"use client";

import { checkIdInQueue, addToQueue } from "@/api/userQueue";

const startSearch = async (userId: string, router: any) => {
  if (userId) {
    const userExists = await checkIdInQueue(userId);

    if (userExists) {
      console.log(
        "User ID already exists in the queue. Please try again later."
      );
    } else {
      addToQueue(userId);
      router.push("/search");
    }
  }
};

export default startSearch;
