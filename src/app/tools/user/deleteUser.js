import { deleteUserProfileData } from "../../data/user_profiles";

import { getLocalStorageItem, removeLocalStorageItem } from "../localStorage";

const DeleteUser = async () => {
  const user_name = getLocalStorageItem("user_name");

  if (user_name) {
    // console.log("user_name", user_name);
    removeLocalStorageItem("user_name");
    await deleteUserProfileData(user_name);
  }
};

export default DeleteUser;
