import {
  fetchUserProfileData,
  insertUserProfileData,
} from "../../data/user_profiles";

import namesDictionary from "../../data/names_dict";

import { setLocalStorageItem, getLocalStorageItem } from "../localStorage";
// import UpdateUserSearching from "./updateUserSearching";

const generateRandomUsername = () => {
  const characters = "0123456789$%#@";
  const name =
    namesDictionary[
      Math.floor(Math.random() * namesDictionary.length)
    ].toLowerCase();

  const randomChars = [];
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomChars.push(characters.charAt(randomIndex));
  }

  const randomUsername = `${name}${randomChars.join("")}`;

  return randomUsername;
};

const RegisterUser = async () => {
  const existing_user_name = getLocalStorageItem("user_name");

  if (!existing_user_name) {
    const { data: fetchData } = await fetchUserProfileData();
    let newUsername;

    do {
      newUsername = generateRandomUsername();
    } while (fetchData.some((user) => user.user_name === newUsername));

    const newUser = {
      user_name: newUsername,
    };

    await insertUserProfileData(newUser);
    setLocalStorageItem("user_name", newUsername);
    return newUsername;
  } else {
    // UpdateUserSearching(true);
    return existing_user_name;
  }
};

export default RegisterUser;
