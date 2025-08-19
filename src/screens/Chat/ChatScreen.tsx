import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
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
import Icon from 'react-native-vector-icons/Ionicons';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
const { width } = Dimensions.get('window');
const MENU_WIDTH = 350;

const ChatScreen = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);

  const flatListRef = useRef<FlatList>(null);
  const chatId = useRoute<ChatScreenRouteProp>().params.chatId;
  const user = auth().currentUser;
  if (!user || !users) {
    return;
  }

  const menuAnim = useRef(new Animated.Value(width)).current; // 화면 밖에서 시작

  const toggleMenu = () => {
    const toValue = menuOpen ? width : width - MENU_WIDTH;

    Animated.timing(menuAnim, {
      toValue,
      duration: 700,
      useNativeDriver: false,
    }).start();

    setMenuOpen(!menuOpen); // 상태 업데이트
  };

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
    });
    inputRef.current?.focus();
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
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        ref={flatListRef}
        data={messages.slice().reverse()} // 뒤집어서 전달
        inverted
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
          ref={inputRef}
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
        <Button title="전송" onPress={() => sendMessage()} />
      </View>
      <TouchableOpacity //메뉴아이콘
        style={{
          position: 'absolute',
          top: 10, // 화면 위에서 10px
          right: 10, // 화면 오른쪽에서 10px
          padding: 8,
          backgroundColor: 'white',
          borderRadius: 20,
          elevation: 3, // 안드로이드 그림자
        }}
        onPress={() => {
          console.log('메뉴 클릭');
          toggleMenu();
        }}
      >
        <Icon name="menu" size={24} color="black" />
      </TouchableOpacity>

      <Animated.View //메뉴 슬라이드
        style={{
          position: 'absolute',
          top: 0,
          right: menuAnim,
          width: MENU_WIDTH,
          height: '100%',
          backgroundColor: 'white',
          elevation: 5,
          padding: 20,
        }}
      >
        <Text style={{ marginBottom: 10 }}>메뉴 항목 1</Text>
        <Text style={{ marginBottom: 10 }}>메뉴 항목 2</Text>
        <Text>메뉴 항목 3</Text>
      </Animated.View>
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
