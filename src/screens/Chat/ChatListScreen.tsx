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
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { chatRoomInfo } from '../../types/chatRoomInfo';

const ChatListScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [chatRooms, setChatRooms] = useState<chatRoomInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const user = auth().currentUser;

  useEffect(() => {
    if (!user) return;
    console.log('ChatListScreen mount');

    const unsubscribe = firestore()
      .collection('chats')
      .where('users', 'array-contains', user.uid)
      .orderBy('lastMessage.timestamp', 'desc')
      .onSnapshot(snapshot => {
        //console.log('전체 문서 수:', snapshot.docs.length);

        if (!snapshot) {
          console.log('스냅샷이 없음');
          setLoading(false);
          return;
        }
        const rooms = snapshot.docs.map(doc => {
          console.log(doc.data()); // 데이터 확인
          return { ...doc.data() } as chatRoomInfo;
        });
        setChatRooms(rooms);
        setLoading(false);
      });

    return () => {
      console.log('ChatListScreen unmount');
      unsubscribe();
    };
  }, [user]);
  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  if (chatRooms.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#ddd',
              backgroundColor: '#fff',
            }}
            onPress={() =>
              navigation.navigate('Chat', {
                chatId: item.id!,
                title: otherUsers.join(', '),
              })
            }
          >
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
              <Text>{item.users.length}명</Text>
            </View>
            <Text style={{ color: '#666', marginTop: 4 }}>
              {lastMessageText}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
};

export default ChatListScreen;
