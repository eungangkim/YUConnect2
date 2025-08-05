// messagingSetup.ts
import{auth,firestore,messaging} from '../firebase'



import { Alert } from 'react-native';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}

export async function getFCMToken() {
  const token = await messaging().getToken();
  console.log('FCM Token:', token);
  return token;
}

export function registerMessageHandler() {
  messaging().onMessage(async remoteMessage => {
    Alert.alert('📩 새 알림', JSON.stringify(remoteMessage.notification?.body));
  });
}

// 이 방식으로 저장
export async function saveFCMTokenToFirestore(newToken:string) {
  const token = await messaging().getToken();
  const uid = auth().currentUser?.uid;
    console.log("토큰 :",token);
  if (uid && token) {
    await firestore().collection('users').doc(uid).update({ fcmToken: newToken });
    console.log('✅ 토큰 저장됨:', newToken);
  }
  
}