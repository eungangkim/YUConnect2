import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"

export type messageInfo = {
  id?: string; // 문서 id
  text: string;
  senderId: string;
  readBy: string[];
  timestamp: FirebaseFirestoreTypes.Timestamp;
};