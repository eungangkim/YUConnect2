import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"
import { messageInfo } from "./messageInfo"

export type chatRoomInfo = {
  id?: string; // chatId
  users: string[];
  lastMessage: {
    text: string;
    timestamp: FirebaseFirestoreTypes.Timestamp;
  };
  createdAt: FirebaseFirestoreTypes.Timestamp;
};