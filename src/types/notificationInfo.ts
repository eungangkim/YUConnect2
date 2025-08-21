import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type notificationInfo = {
  id: string;
  title: string;
  body: string;
  senderId: string;
  extraData: string;
  type: string;
  status:string;
  createAt:  FirebaseFirestoreTypes.Timestamp;
};
