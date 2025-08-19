import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { chatRoomInfo } from '../../types/chatRoomInfo';
import style from '../../styles/screens/Chat/ChatListScreen';

const ChatListScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [chatRooms, setChatRooms] = useState<chatRoomInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const user = auth().currentUser;

  if (!user) return null;

  // 1️⃣ 실시간 snapshot 구독 (마운트 시)

  // 2️⃣ 화면 포커스 시 강제 fetch (뒤로가기 후 최신화)
  useFocusEffect(
    React.useCallback(() => {
      const querySnapshot = firestore()
        .collection('chats')
        .where('users', 'array-contains', user.uid);
      //.orderBy('lastMessage.timestamp', 'desc');
      const unsubscribe = querySnapshot.onSnapshot(
        { includeMetadataChanges: true },
        async snapshot => {
          if (!snapshot) {
            console.log('스냅샷 없음');
            return;
          }
          const rooms = snapshot.docs.map(
            doc => ({ ...doc.data() } as chatRoomInfo),
          );
          console.log('대화방 목록:', rooms);
          rooms.sort((a, b) => {
            return (
              b.lastMessage.timestamp.toMillis() -
              a.lastMessage.timestamp.toMillis()
            );
          });
          await setChatRooms(rooms);
          setLoading(false);
        },
      );
      return () => unsubscribe();
    }, [user]),
  );
  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  if (chatRooms.length === 0) {
    return (
      <View style={style.noChat}>
        <Text>참가한 채팅방이 없습니다.</Text>
      </View>
    );
  }
  console.log('현재 사용자 UID:', user?.uid);

  return (
    <FlatList
      data={chatRooms}
      renderItem={({ item }) => {
        const otherUsers = item.users.filter(uid => uid !== user?.uid);
        const title = item.title ? item.title : '';
        const lastMessageText = item.lastMessage?.text ?? '메시지가 없습니다.';
        return (
          <TouchableOpacity
            style={style.chat}
            onPress={() =>
              navigation.navigate('Chat', {
                chatId: item.id!,
                title: otherUsers.join(', '),
              })
            }
          >
            <View
              style={style.chatInfo}
            >
              <Text style={{ fontWeight: 'bold' }}>{title}</Text>
              <Text>{item.users.length}명</Text>
            </View>
            <Text style={style.lastMessage}>{lastMessageText}</Text>
          </TouchableOpacity>
        );
      }}
    />
  );
};

export default ChatListScreen;
