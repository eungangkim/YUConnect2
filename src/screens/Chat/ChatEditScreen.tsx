import { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { firestore } from '../../firebase';
import { RouteProp, useRoute } from '@react-navigation/native';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { RootStackParamList } from '../../types/navigation';

type ChatEditScreenRouteProp = RouteProp<RootStackParamList, 'ChatEdit'>;

const ChatEditScreen = () => {
  const [title, setTitle] = useState('');
  const [input, setInput] = useState('');
  const route = useRoute<ChatEditScreenRouteProp>();
  const chatId = route.params.chatId;
  const [docRef, setDocRef] =
  useState<FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> | null>(null);

useEffect(() => {
  const ref = firestore().collection('chats').doc(chatId);
  setDocRef(ref);

  async function fetchDoc() {
    const data = (await ref.get()).data();
    setTitle(data?.title ?? '무제');
  }
  fetchDoc();
}, [chatId]);

async function saveTitle() {
  if (!input.trim()) {
    console.warn('제목이 비어 있음, 저장하지 않음');
    return;
  }
  if (!docRef) {
    console.error('docRef 없음');
    return;
  }

  try {
    await docRef.update({ title: input });
    setInput('');
    setTitle(input); // UI도 업데이트
  } catch (error) {
    console.error('제목 저장 실패:', error);
  }
}
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ flex: 4, justifyContent: 'center' }}>
        <Text style={{ fontSize: 25 }}>대화방 이름 : {title}</Text>
      </View>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <TextInput
          style={{
            height: 40,
            flex: 8.5,
            borderWidth: 1,
            borderRadius: 5,
            padding: 8,
            marginHorizontal: 10,
            fontSize: 20,
          }}
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity
          style={{
            flex: 1.5,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            marginRight: 10,
            borderRadius: 5,
          }}
          onPress={() => saveTitle()}
        >
          <Text style={{ fontSize: 20 }}>저장</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 9 }}></View>
    </View>
  );
};

export default ChatEditScreen;
