// messagingSetup.ts
import { firebase } from '@react-native-firebase/firestore';
import { auth, firestore, messaging } from '../firebase';
import axios from 'axios'; // 또는 fetch 사용 가능
import notifee, { EventType } from '@notifee/react-native';

import { Alert, AppState } from 'react-native';
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
export async function requestNotificationPermission() {
  await notifee.requestPermission(); // iOS
}
export async function getFCMToken() {
  const token = await messaging().getToken();
  console.log('FCM Token:', token);
  return token;
}
export function registerForegroundHandler() {
  messaging().onMessage(async remoteMessage => {
    console.log('포그라운드 메시지:', remoteMessage);

    // 앱이 활성 상태일 때만 Alert
    if (AppState.currentState === 'active') {
      await notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
          channelId: 'default',
          smallIcon: 'ic_launcher', // AndroidManifest.xml에 있는 아이콘 이름
        },
      });
    }
  });
}
export function registerBackgroundHandler() {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    console.log('Notifee 백그라운드 이벤트:', type, detail);

    if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
      const { notification, pressAction } = detail;
      console.log('알림 클릭/액션:', notification, pressAction);

      // 예: 특정 화면으로 네비게이션
      // NavigationService.navigate('Chat', { chatId: notification?.data?.chatId });
    }
  });
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('백그라운드 메시지:', remoteMessage);

    if (!remoteMessage.notification) {
      // 데이터 메시지만 직접 띄우기
      await notifee.displayNotification({
        title: String(
          remoteMessage.data?.title ?? remoteMessage.data?.title ?? '알림',
        ),
        body: String(
          remoteMessage.data?.body ?? remoteMessage.data?.body ?? '',
        ),
        android: { channelId: 'default' },
      });
    }
  });
}
export function registerSaveNotificationHandler() {
  messaging().onMessage(async remoteMessage => {
    await firestore().collection('notifications').add({
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      timestamp: new Date(),
    });
  });
}
export function registerTokenRefreshHandler(
  saveToken: (token: string) => void,
) {
  messaging().onTokenRefresh(newToken => {
    console.log('FCM 토큰 갱신:', newToken);
    saveToken(newToken); // Firestore나 서버에 저장
  });
}

export const onMessageReceived = async (
  message: FirebaseMessagingTypes.RemoteMessage,
) => {
  console.log('Message:', JSON.stringify(message));
};

// 이 방식으로 저장
export async function saveFCMTokenToFirestore(newToken: string) {
  const uid = await auth().currentUser?.uid;
  console.log('토큰을 저장중...   uid:', uid, '   newToken:', newToken);
  if (uid && newToken) {
    await firestore()
      .collection('users')
      .doc(uid)
      .update({ tokens: firebase.firestore.FieldValue.arrayUnion(newToken) });
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
      body: `${displayName}님이 대화창에 참여하고 싶어합니다`,
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
export async function sendMessageNotificationToUsers(
  senderId: string,
  users: string[],
  message: string,
) {
  try {
    const docSnap = await firestore().collection('users').doc(senderId).get();
    if (!docSnap) {
      return;
    }
    const displayName = docSnap.data()?.name ?? '익명의 사용자';
    console.log('알림 보내는 사람의 문서 정보:', docSnap);
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

    const MAX_MESSAGE_LENGTH = 50; // 50자 제한
    const truncatedMessage = truncateMessage(message, MAX_MESSAGE_LENGTH);

    // 2️⃣ 서버로 알림 요청
    await axios.post('https://sendnotification-p2szwh77pa-uc.a.run.app', {
      tokens: tokens,
      title: ' ',
      body: `${displayName}: ${truncatedMessage}`,
    });

    console.log('메시지 알림 전송 완료 tokens:', tokens);
  } catch (error) {
    console.error('메시지 알림 전송 실패:', error);
  }
}

function truncateMessage(message: string, maxLength: number) {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
}

async function createChannel() {
  await notifee.createChannel({
    id: 'default',
    name: '기본 알림 채널',
  });
}
export async function initNotifications(saveToken: (token: string) => void) {
  await requestNotificationPermission();
  await createChannel();
  registerForegroundHandler();
  registerBackgroundHandler();
  registerSaveNotificationHandler();
  const token = await messaging().getToken();
  saveToken(token);

  registerTokenRefreshHandler(saveToken);
}
