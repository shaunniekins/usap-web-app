// Function to set an item in localStorage
export const setLocalStorageItem = (key, value) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Function to get an item from localStorage
export const getLocalStorageItem = (key) => {
  if (typeof window !== "undefined") {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
};

// Function to remove an item from localStorage
export const removeLocalStorageItem = (key) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};
