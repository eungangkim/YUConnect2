import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { chatRoomInfo } from '../../types/chatRoomInfo';


const ChatListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [chatRooms, setChatRooms] = useState<chatRoomInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const user = auth().currentUser;

  useEffect(() => {
    if (!user) return;

    const unsubscribe = firestore()
      .collection('chats')
      .where('users', 'array-contains', user.uid)
      .orderBy('lastMessage.timestamp', 'desc')
      .onSnapshot(snapshot => {
        if (!snapshot) {
          setLoading(false);
          return;
        } 
        const rooms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as chatRoomInfo[];
        setChatRooms(rooms);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [user]);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  if (chatRooms.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>참가한 채팅방이 없습니다.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={chatRooms}
      renderItem={({ item }) => {
        const otherUsers = item.users.filter(uid => uid !== user?.uid);
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
              navigation.navigate('Chat', { chatId: item.id!, title: otherUsers.join(', ') })
            }
          >
            <Text style={{ fontWeight: 'bold' }}>{otherUsers.join(', ')}</Text>
            <Text style={{ color: '#666', marginTop: 4 }}>{lastMessageText}</Text>
          </TouchableOpacity>
        );
      }}
    />
  );
};

export default ChatListScreen;
