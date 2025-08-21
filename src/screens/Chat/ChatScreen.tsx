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
  Modal,
  Alert,
} from 'react-native';
import firestore, {
  doc,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { chatRoomInfo } from '../../types/chatRoomInfo';
import { sendNotification } from '../../firebase/messageingSetup';
import { Timestamp } from '@google-cloud/firestore';
import IoniIcon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import style from '../../styles/screens/Chat/ChatScreen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  deleteDocWithCollectionAndId,
  getDocRefWithCollectionAndId,
} from '../../firebase/firestoreFunctions';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
const { width } = Dimensions.get('window');
const MENU_WIDTH = 350;

const ChatScreen = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [usersNameMap, setUsersNameMap] = useState<Map<string, string>>(
    new Map(),
  );
  const [modalVisible, setModalVisible] = useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
      const map = await initUsersNameMap(participatedUsers);
      setUsersNameMap(map);

      if (isMounted) setUsers(participatedUsers!);

      console.log('map entries:', Array.from(usersNameMap.entries()));
    };
    fetchUsers();

    const querySnapshot = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'desc');

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
    await sendNotification( users,"메세지 전송",(user.displayName??"(이름 없음)")+" : "+input,"message");

    setInput('');
  };
  async function exitChat() {
    if (users.length == 1) {
      // confirm을 Promise로 감싸서 기다릴 수 있게 함
      const confirm = await new Promise<boolean>(resolve => {
        Alert.alert('경고', '정말로 대화방을 나가시겠습니까?', [
          { text: '거절', onPress: () => resolve(false), style: 'cancel' },
          { text: '수락', onPress: () => resolve(true) },
        ]);
      });

      if (!confirm) return; // 거절 시 함수 종료
      else {
        await deleteDocWithCollectionAndId('chats', chatId);
        navigation.goBack();
        return;
      }
    }
    const uid = user?.uid;
    const docRef = await getDocRefWithCollectionAndId('chats', chatId);

    await docRef.update({
      users: firestore.FieldValue.arrayRemove(uid),
    });
    navigation.goBack();
  }
  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        inverted
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => {
          const prevMessage = messages[index + 1]; // inverted이므로 다음 메시지가 이전
          const showName =
            user.uid !== item.senderId &&
            (!prevMessage || prevMessage.senderId !== item.senderId);
          return (
            <View>
              {showName && (
                <View>
                  <Text style={style.name}>
                    {usersNameMap?.get(item.senderId) ?? '(이름 없음)'}
                  </Text>
                </View>
              )}
              <View
                style={[
                  {
                    alignSelf:
                      item.senderId === user?.uid ? 'flex-end' : 'flex-start',
                    backgroundColor:
                      item.senderId === user?.uid ? '#4e8cff' : '#ddd',
                  },
                  style.message,
                ]}
              >
                <Text
                  style={{
                    color: item.senderId === user?.uid ? '#fff' : '#000',
                  }}
                >
                  {item.text}
                </Text>
                <Text style={style.mark}>
                  {users.length - item.readBy.length == 0
                    ? '모두 읽음'
                    : users.length - item.readBy.length}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View style={{ flexDirection: 'row', marginTop: 5 }}>
        <TextInput
          ref={inputRef}
          style={style.textInput}
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
        style={style.menu}
        onPress={() => {
          console.log('메뉴 클릭');
          toggleMenu();
        }}
      >
        <IoniIcon name="menu" size={24} color="black" />
      </TouchableOpacity>

      <Animated.View //메뉴 슬라이드
        style={[
          style.menuSlider,
          {
            right: menuAnim,
            width: MENU_WIDTH,
          },
        ]}
      >
        <Text style={{ marginBottom: 10 }}>사용자 목록</Text>

        <FlatList
          data={Array.from(usersNameMap.entries())}
          keyExtractor={item => item[0]}
          renderItem={({ item, index }) => {
            const [uid, name] = item;
            return <Text style={style.name}>{name ?? '익명'}</Text>;
          }}
        />
        <TouchableOpacity style={{}} onPress={() => setModalVisible(true)}>
          <Feather name="settings" size={30} />
        </TouchableOpacity>
        <Text>메뉴 항목 3</Text>
        {modalVisible && (
          <Modal
            transparent
            visible={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableOpacity
              style={style.modalBackground}
              activeOpacity={1}
              onPressOut={() => setModalVisible(false)}
            >
              <View style={style.modalContent}>
                <TouchableOpacity
                  style={style.settingContainer}
                  onPress={() => navigation.navigate('ChatEdit', { chatId })}
                >
                  <AntDesign name="edit" size={25} style={{ margin: 9 }} />
                  <Text style={style.nameEdit}>대화방 이름 편집</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={style.settingContainer}
                  onPress={() => exitChat()}
                >
                  <IoniIcon
                    name="exit-outline"
                    size={25}
                    style={{ margin: 9 }}
                  />
                  <Text style={style.nameEdit}>대화방 탈퇴</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
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

async function initUsersNameMap(users: string[] | undefined) {
  const map = new Map<string, string>();
  if (!users) return map;
  console.log('진입', users.length);
  await Promise.all(
    users.map(async uid => {
      const docRef = await firestore().collection('users').doc(uid).get();
      map.set(uid, docRef.data()?.name ?? '익명');
    }),
  );
  return map;
}
export default ChatScreen;
