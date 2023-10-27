import { updateUserProfileData } from "../../data/user_profiles";

import { getLocalStorageItem } from "../localStorage";

const UpdateUserSearching = async (isSearching) => {
  const user_name = getLocalStorageItem("user_name");

  const updateData = {
    is_searching: isSearching,
  };

  await updateUserProfileData(user_name, updateData);
  // await updateUserProfileData(user_id, updateData);
};

export default UpdateUserSearching;
