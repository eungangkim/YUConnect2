// messagingSetup.ts
import { firebase } from '@react-native-firebase/firestore';
import { auth, firestore, messaging } from '../firebase';
import axios from 'axios'; // 또는 fetch 사용 가능

import { Alert } from 'react-native';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

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
export const onMessageReceived = async (
  message: FirebaseMessagingTypes.RemoteMessage,
) => {
  console.log('Message:', JSON.stringify(message));
};
// 이 방식으로 저장
export async function saveFCMTokenToFirestore(newToken: string) {
  const token = await messaging().getToken();
  const uid = auth().currentUser?.uid;
  console.log('토큰 :', token);
  if (uid && token) {
    await firestore()
      .collection('users')
      .doc(uid)
      .update({ tokens: firebase.firestore.FieldValue.arrayUnion(token) });
    console.log('✅ 토큰 저장됨:', newToken);
  }
}

export async function onPostParticipate(postId: string) {
  try {    
    const postDoc = await firestore().collection('posts').doc(postId).get();
    if (!postDoc.exists()) {
      console.error('해당 게시글 문서가 존재하지 않습니다.');
      return;
    }

    const postData = postDoc.data();
    if (!postData) {
      console.log('게시글 데이터가 없습니다.');
      return;
    }

    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.log('현재 사용자가 없습니다.');
      return;
    }

    const { title, authorUid } = postData;
    const displayName = currentUser.displayName ?? '익명사용자';
    if (!title || !authorUid) {
      console.log('title 또는 authorUid가 없습니다.', { title, authorUid });
      return;
    }

    const userDoc = await firestore().collection('users').doc(authorUid).get();
    const tokens = userDoc.data()?.tokens;

    if (!tokens || tokens.length === 0) {
      return console.log('⚠️ FCM 토큰이 존재하지 않습니다.');
    }
    
    // 서버로 알림 요청
    await axios.post('https://sendnotification-p2szwh77pa-uc.a.run.app', {
      tokens: tokens,
      title: `"${title}" 대화창에 참여하고 싶어합니다!! 요청을 수락해주세요!!`,
      body:`${displayName}님이 대화창에 참여하고 싶어합니다`
    });

    Alert.alert('알림이 전송되었습니다!');    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ 알림 전송 실패 - AxiosError:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error('❌ 알림 전송 실패 - Unknown:', error);
    }
  }
}
export async function sendMessageNotificationToUsers(senderId:string,users:string[],message:string) {
  try {
    const docSnap=await firestore().collection('users').doc(senderId).get();
    if(!docSnap){return}
    const displayName= docSnap.data()?.name;
    let tokens: string[] = [];

    // 1️⃣ users 배열 순회하며 tokens 수집
    for (const uid of users) {
      if (uid === senderId) continue; // 자기 자신 제외

      const docSnap = await firestore().collection('users').doc(uid).get();
      if (docSnap.exists()) {
        const data = docSnap.data();
        const userTokens: string[] = data?.tokens ?? [];
        tokens = tokens.concat(userTokens);
      }
    }

    if (tokens.length === 0) {
      console.log('푸시 알림을 받을 토큰이 없음');
      return;
    }

    // 2️⃣ 서버로 알림 요청
    await axios.post('https://sendnotification-p2szwh77pa-uc.a.run.app', {
      tokens: tokens,
      title: 'YUConnect',
      body: `${displayName}: ${message}`
    });

    console.log('메시지 알림 전송 완료');
  } catch (error) {
    console.error('메시지 알림 전송 실패:', error);
  }
}