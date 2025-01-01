import { User, ChatSession } from "@/types";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Functions for managing users, sessions, and messages
export const getUserByUUID = async (
  uuid: string
): Promise<(User & { id: string }) | null> => {
  const q = query(collection(db, "users"), where("uuid", "==", uuid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty
    ? null
    : ({
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      } as User & { id: string });
};

// Create a new user
export const createUser = async (uuid: string) => {
  const existingUser = await getUserByUUID(uuid);
  if (existingUser) {
    throw new Error("UUID already exists.");
  }
  const userRef = collection(db, "users");
  await addDoc(userRef, {
    uuid,
    is_searching: false,
    current_session: null,
    last_seen: new Date(),
  });
};

// Update user status
export const updateUser = async (userId: string, data: Partial<User>) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, data);
};

// Create a chat session
export const createChatSession = async (userIds: string[]) => {
  const sessionRef = collection(db, "chatSessions");
  const session = await addDoc(sessionRef, {
    users: userIds,
    created_at: new Date(),
    active: true,
  });
  return session.id;
};

// Listen to session changes
export const listenToSession = (
  sessionId: string,
  callback: (session: ChatSession | undefined) => void
) => {
  const sessionRef = doc(db, "chatSessions", sessionId);
  return onSnapshot(sessionRef, (doc) => {
    callback(doc.data() as ChatSession | undefined);
  });
};

// Delete chat session

export const deleteChatSession = async (sessionId: string) => {
  await deleteDoc(doc(db, "chatSessions", sessionId));
};

export const endSession = async (sessionId: string, leavingUserId: string) => {
  const sessionRef = doc(db, "chatSessions", sessionId);
  const sessionSnap = await getDoc(sessionRef);
  const sessionData = sessionSnap.data();

  if (!sessionData) return;

  const remainingUsers = sessionData.users.filter(
    (id: string) => id !== leavingUserId
  );

  if (remainingUsers.length === 0) {
    // Delete session and messages only when all users have left
    await Promise.all([
      deleteDoc(doc(db, "chatSessions", sessionId)),
      deleteMessages(sessionId),
    ]);
  } else {
    // Update session with remaining users
    await updateDoc(sessionRef, { users: remainingUsers });
  }

  // Reset leaving user's status
  const leavingUser = await getUserByUUID(leavingUserId);
  if (leavingUser) {
    await updateUser(leavingUser.id, {
      is_searching: false,
      current_session: null,
    });
  }
};

// Add new function to delete messages
export const deleteMessages = async (sessionId: string) => {
  const messagesRef = collection(db, "messages");
  const q = query(messagesRef, where("session_id", "==", sessionId));
  const querySnapshot = await getDocs(q);

  const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));

  await Promise.all(deletePromises);
};

// Add this new function
export const updateTypingStatus = async (userId: string, isTyping: boolean) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { is_typing: isTyping });
};
