// messagingSetup.ts
import notifee, {
  AndroidImportance,
  EventDetail,
  EventType,
  Notification,
  NotificationPressAction,
} from '@notifee/react-native';
import { firebase } from '@react-native-firebase/firestore';
import { auth, firestore, messaging } from '../firebase';
import axios from 'axios'; // 또는 fetch 사용 가능
import Toast, { ToastShowParams } from 'react-native-toast-message';

import { Alert, AppState } from 'react-native';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import {
  addChatToFirestore,
  addDoc,
  getDocRefWithCollectionAndId,
  updateDoc,
} from './firestoreFunctions';
import { notificationInfo } from '../types/notificationInfo';

// 이 방식으로 저장
export async function saveFCMTokenToFirestore(newToken: string) {
  const uid = await auth().currentUser?.uid;
  if (uid && newToken) {
    await firestore()
      .collection('users')
      .doc(uid)
      .update({ tokens: firebase.firestore.FieldValue.arrayUnion(newToken) });
  }
}

export async function sendNotification(
  users: string[],
  title: string,
  message: string,
  type: string,
  extraData?: object,
) {
  try {
    const senderId = auth().currentUser?.uid!;
    let tokens: string[] = await getTokens(users, senderId);

    if (tokens.length === 0) {
      console.log('푸시 알림을 받을 토큰이 없음');
      return;
    }

    const MAX_MESSAGE_LENGTH = 50; // 50자 제한
    const truncatedMessage = truncateMessage(message, MAX_MESSAGE_LENGTH);

    // 2️⃣ 서버로 알림 요청
    await axios.post('https://sendnotification-p2szwh77pa-uc.a.run.app', {
      tokens: tokens,
      data: {
        title,
        body: truncatedMessage,
        senderId,
        type,
        status: type === 'chat_request' ? 'pending':'unread',
        extraData: extraData ? JSON.stringify(extraData) : '',
      },
    });

    console.log('메시지 알림 전송 완료 tokens:', tokens);
  } catch (error) {
    console.error('메시지 알림 전송 실패:', error);
  }
}

async function getTokens(users: string[], senderId: string) {
  let tokens: string[] = [];
  for (const uid of users) {
    if (uid === senderId) continue; // 자기 자신 제외

    const docSnap = await firestore().collection('users').doc(uid).get();
    if (docSnap.exists()) {
      const data = docSnap.data();
      const userTokens: string[] = data?.tokens ?? [];
      tokens = tokens.concat(userTokens);
    }
  }
  return tokens;
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

  const token = await messaging().getToken();
  saveToken(token);

  registerTokenRefreshHandler(saveToken);
}

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
    handleIncomingMessage(remoteMessage);
    console.log(
      '포그라운드 메세지: remoteMessage.messageId:',
      remoteMessage.messageId,
    );
  });
  notifee.onForegroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
      console.log('백그라운드에서 알림 클릭 또는 액션 버튼 클릭');
      handlePressedMessage(type, detail);
    }
  });
}

export function registerBackgroundHandler() {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    handleIncomingMessage(remoteMessage);
  });
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
      console.log('백그라운드에서 알림 클릭 또는 액션 버튼 클릭');
      handlePressedMessage(type, detail);
    }
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
async function handleIncomingMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) {
  const user = auth().currentUser;
  if (!user) return;

  console.log('📩 메시지 수신:', remoteMessage);

  // 공통 저장 로직
  if (remoteMessage.data?.type !== 'message') {
    await addDoc(
      `users/${user.uid}/notifications`,
      { ...remoteMessage.data },
      remoteMessage.messageId,
    );
  }
  displayToast(remoteMessage);

  // 앱 상태별 분기 처리
  if (AppState.currentState === 'background') {
    displayNotification(remoteMessage);
    // 👉 포그라운드일 때만 Toast/Alert 표시
  }
}
async function handlePressedMessage(type: EventType, detail: EventDetail) {
  console.log(
    '알림 클릭시 type:',
    type,
    '문자의 type:',
    detail.notification?.data?.type,
  );
  if (type === EventType.ACTION_PRESS) {
    if (detail.notification?.data?.type === 'chat_request') {
      const notification: notificationInfo =
        detail.notification as notificationInfo;
      handleChatRequest(notification, detail.pressAction?.id!);
      // Firestore update, 채팅방 연결 등
    }
  }
}

export async function handleChatRequest(
  notification: notificationInfo,
  actionId: string,
) {
  const { senderId, extraData } = notification;
  const user = auth().currentUser;
  const notifiDocRef = await getDocRefWithCollectionAndId(
    `users/${user?.uid}/notifications`,
    String(notification.id),
  );
  try {
    if (actionId == 'accept') {
      /*
    1. 포스트 문서에 사용자 추가
    2. 채팅 문서에 사용자 추가
    3. 알림 문서 status 업데이트
    4. 메세지 전송
    */
      let parsedExtraData: { postId?: string; chatId?: string } | null = null;

      let chatRef;

      parsedExtraData = extraData ? JSON.parse(extraData) : null;

      if (!parsedExtraData) return;
      const postRef = firestore()
        .collection('posts')
        .doc(parsedExtraData.postId);
      const postSnap = await postRef.get();

      if (parsedExtraData.chatId) {
        chatRef = firestore().collection('chats').doc(parsedExtraData.chatId);
      }

      if (!(await chatRef?.get())?.exists()) {
        chatRef = await addChatToFirestore(postSnap.data()?.title);
      }
      // 1번
      await postRef.update({
        chatId: chatRef?.id,
        users: firestore.FieldValue.arrayUnion(senderId),
      });
      // 2번
      await chatRef!.update({
        users: firestore.FieldValue.arrayUnion(senderId),
      });
      // 3번
      notifiDocRef.update({
        status: 'accept',
      });

      // 수락 알림 전송
      await sendNotification(
        [String(senderId)],
        '요청 수락 알림',
        '대화방 참가 요청이 수락되었습니다.',
        'chat_response',
      );
    } else if (actionId === 'reject') {
      notifiDocRef.update({ status: 'rejected' });
      await sendNotification(
        [String(senderId)],
        '요청 거절 알림',
        '대화방 참가 요청이 거절되었습니다.',
        'chat_response',
      ); // 거절 처리 로직
    }
  } catch (error) {
    console.log('알림 클릭 이벤트 처리중 에러 발생...', error);
  }
}
async function displayNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) {
  if (!remoteMessage.data) return;
  const type = remoteMessage.data.type;
  const title = String(remoteMessage.data.title ?? '알림');
  const body = String(remoteMessage.data.body ?? '');

  const notificationOptions = {
    title,
    body,
    importance: AndroidImportance.HIGH,
    android: {
      channelId: 'default',
      smallIcon: 'ic_launcher',
      actions:
        type === 'chat_request'
          ? [
              { title: '수락', pressAction: { id: 'accept' } },
              { title: '거절', pressAction: { id: 'reject' } },
            ]
          : undefined,
    },
    data: {
      id: remoteMessage.messageId ?? '',
      type,
      senderId: remoteMessage.data.senderId,
      extraData: remoteMessage.data.extraData,
    },
  };
  await notifee.displayNotification(notificationOptions);
}

function displayToast(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
  if (!remoteMessage.data) return;
  const text1 = String(remoteMessage.data?.title);
  const text2 = String(remoteMessage.data?.body);

  const toastOptions: ToastShowParams = {
    type: 'success', // 'info' | 'error' | 'success'
    text1: text1,
    text2: text2,
    position: 'top',
    visibilityTime: 5000, // 3초 후 자동 닫힘
  };

  Toast.show(toastOptions); //백그라운드에서는 실행이 안됨
}
