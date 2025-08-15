import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Button, FlatList, Text } from 'react-native';
import firestore, {
  doc,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { chatRoomInfo } from '../../types/chatRoomInfo';
import { sendMessageNotificationToUsers } from '../../firebase/messageingSetup';
import { Timestamp } from '@google-cloud/firestore';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

const ChatScreen = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const chatId = useRoute<ChatScreenRouteProp>().params.chatId;
  const user = auth().currentUser;
  if (!user || !users) {
    return;
  }
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const fetchUsers = async () => {
      const participatedUsers = await getParticipatedUsers(chatId);
      if (isMounted) setUsers(participatedUsers!);
    };
    fetchUsers();

    const querySnapshot = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'asc');

    const unsubscribe = querySnapshot.onSnapshot(async snapshot => {
      if (!isMounted) return;

      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 메시지 읽음 처리
      await markMessagesAsRead(querySnapshot, user.uid);

      setMessages(msgs);

      // 최하단 스크롤
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 150);
    });

    return () => {
      isMounted = false;
      unsubscribe(); // 이전 구독 해제
    };
  }, [chatId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const docRef = await firestore().collection('chats').doc(chatId);
    await docRef.update({
      lastMessage: {
        text: input,
        timestamp: firestore.FieldValue.serverTimestamp(),
      },
    });
    const mesRef = await docRef.collection('messages').add({
      text: input,
      senderId: user.uid,
      readBy: [user.uid],
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    await mesRef.update({ id: mesRef.id });
    await sendMessageNotificationToUsers(user.uid, users, input);

    setInput('');
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf:
                item.senderId === user?.uid ? 'flex-end' : 'flex-start',
              backgroundColor: item.senderId === user?.uid ? '#4e8cff' : '#ddd',
              padding: 10,
              borderRadius: 10,
              marginVertical: 2,
            }}
          >
            <Text
              style={{ color: item.senderId === user?.uid ? '#fff' : '#000' }}
            >
              {item.text}
            </Text>
            <Text>
              {users.length - item.readBy.length == 0
                ? '모두 읽음'
                : users.length - item.readBy.length}
            </Text>
          </View>
        )}
      />

      <View style={{ flexDirection: 'row', marginTop: 5 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderRadius: 5, padding: 8 }}
          value={input}
          onChangeText={setInput}
          placeholder="메시지 입력"
          multiline={true}
          returnKeyType="default"
          submitBehavior="newline"
          onSubmitEditing={() => {
            sendMessage();
          }}
        />
        <Button title="전송" onPress={()=> sendMessage()} />
      </View>
    </View>
  );
};

const markMessagesAsRead = async (
  querySnapshot: FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData>,
  currentUserUid: string,
) => {
  const messagesSnap = await querySnapshot.get();

  messagesSnap.docs.forEach(async doc => {
    const data = doc.data();
    if (!data.readBy?.includes(currentUserUid)) {
      await doc.ref.update({
        readBy: firestore.FieldValue.arrayUnion(currentUserUid),
      });
    }
  });
};

async function getParticipatedUsers(chatId: string) {
  const docSnap = await firestore().collection('chats').doc(chatId).get();

  if (docSnap.exists()) {
    const data = docSnap.data() as chatRoomInfo; // 문서의 모든 필드 객체
    return data.users;
  }
}
export default ChatScreen;
