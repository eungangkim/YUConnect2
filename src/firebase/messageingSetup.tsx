// messagingSetup.ts
import{auth,firestore,messaging} from '../firebase'
import axios from 'axios'; // 또는 fetch 사용 가능


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

export async function onPostParticipate(postId: string) {
  try {
    // 게시글에서 작성자 UID 가져오기
    const postDoc = await firestore().collection('posts').doc(postId).get();
    const authorUid = postDoc.data()?.authorUid;
    const currentUser = auth().currentUser;

    if (!authorUid || !currentUser) return;

    // 서버로 알림 요청
    await axios.post('https://console.firebase.google.com/project/yuconnect2-170c9/overview', {
      receiverUid: authorUid,
      senderName: currentUser.displayName ?? '익명 사용자',
      postTitle: postDoc.data()?.title,
    });

    Alert.alert('알림이 전송되었습니다!');
  } catch (error) {
    console.error('알림 전송 실패:', error);
  }
}