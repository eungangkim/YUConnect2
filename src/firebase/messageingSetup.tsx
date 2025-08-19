// messagingSetup.ts
import notifee, { EventType } from '@notifee/react-native';
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
} from './firestoreFunctions';

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
  const user = auth().currentUser!;
  messaging().onMessage(async remoteMessage => {
    console.log('포그라운드 메시지:', remoteMessage);
    addDoc(`users/${user.uid}/notifications`, remoteMessage.data!);

    // 앱이 활성 상태일 때만 Alert
    if (AppState.currentState === 'active' && remoteMessage.data) {
      const type = remoteMessage.data.type;
      const title = String(remoteMessage.data.title ?? '알림');
      const body = String(remoteMessage.data.body ?? '');
      const notificationOptions = {
        title,
        body,
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
          type,
          requestId: remoteMessage.data.senderId,
          extraData: remoteMessage.data.extraData,
        },
      };

      const toastOptions: ToastShowParams = {
        type: 'success', // 'info' | 'error' | 'success'
        text1: type === 'chat_request' ? '대화방 참가 요청' : '알림',
        text2: '친구가 대화 요청을 보냈습니다 📩',
        position: 'top',
        visibilityTime: 5000, // 3초 후 자동 닫힘
      };

      // type이 정의되어 있으면 알림 표시
      if (type) {
        await notifee.displayNotification(notificationOptions);
        Toast.show(toastOptions);
      } 
    }
  });
  notifee.onForegroundEvent(async ({ type, detail }) => {
    const { pressAction, notification } = detail;
    if (!notification?.data) return;

    const { requestId, type: notifiType, extraData } = notification.data;
    let parsedExtraData: { postId?: string; chatId?: string } | null = null;
    if (typeof extraData !== 'string') return;
    try {
      parsedExtraData = extraData ? JSON.parse(extraData) : null;
    } catch (e) {
      console.log('extraData 파싱 실패:', e);
    }

    if (type === EventType.ACTION_PRESS) {
      if (pressAction?.id === 'accept' && parsedExtraData) {
        console.log('✅ 채팅 요청 수락:', notification);

        // 채팅방 참조 준비
        let chatRef;
        if (parsedExtraData.chatId) {
          chatRef = firestore().collection('chats').doc(parsedExtraData.chatId);
        }

        if (!(await chatRef?.get())?.exists()) {
          // 포스트 정보 가져오기
          const postRef = firestore()
            .collection('posts')
            .doc(parsedExtraData.postId);
          const postSnap = await postRef.get();

          // 새 채팅 생성
          chatRef = await addChatToFirestore(postSnap.data()?.title);

          // 포스트 문서에 chatId 업데이트
          await postRef.update({
            chatId: chatRef.id,
            users: firestore.FieldValue.arrayUnion(requestId),
          });
        }

        // 채팅 참여자 추가
        await chatRef!.update({
          users: firestore.FieldValue.arrayUnion(requestId),
        });

        console.log('chat 문서', chatRef);

        // 수락 알림 전송
        await sendNotification(
          [String(requestId)],
          '요청 수락 알림',
          '대화방 참가 요청이 수락되었습니다.',
          'message',
        );
      } else if (pressAction?.id === 'reject') {
        console.log('❌ 채팅 요청 거절:', requestId);
        // 거절 처리 로직
      }
    }
  });
}

export function registerBackgroundHandler() {
  const user = auth().currentUser!;

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('백그라운드 메시지:', remoteMessage);
    addDoc(`users/${user.uid}/notifications`, remoteMessage.data!);

    if (remoteMessage.data) {
      // 데이터 메시지만 직접 띄우기
      const type = remoteMessage.data.type;
      const title = String(remoteMessage.data.title ?? '알림');
      const body = String(remoteMessage.data.body ?? '');

      const notificationOptions = {
        title,
        body,
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
          type,
          requestId: remoteMessage.data.senderId,
        },
      };

      // type이 정의되어 있으면 알림 표시
      if (type) {
        await notifee.displayNotification(notificationOptions);
      }
    }
  });
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.ACTION_PRESS) {
      if (detail.pressAction?.id === 'accept') {
        console.log(
          '✅ [백그라운드] 채팅 요청 수락:',
          detail.notification?.data?.requestId,
        );
        // Firestore update, 채팅방 연결 등
      } else if (detail.pressAction?.id === 'reject') {
        console.log('❌ [백그라운드] 채팅 요청 거절');
      }
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
