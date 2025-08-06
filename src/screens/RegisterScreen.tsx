import { Button, ScrollView } from 'react-native';
import { useState } from 'react';

import type { MemberInfoParam } from '../types/memberInfo'; // 타입 경로는 상황에 맞게
import MemberForm from '../components/MemberForm';
import { firestore } from '../firebase';

const RegisterScreen = () => {
  const [member, setMember] = useState<MemberInfoParam>({
    id: '',
    name: '',
    sex: true,
    email: '',
    tel: '',
    birth: '',
    images: [{ uri: '' }],
    mbti: '',
    interest: { interests: {}, detailedInterests: {} },
    forLove: false,
    forFriendship: false,
    MannerDegree:50,
  });
  return (
        <ScrollView contentContainerStyle={{padding:10}}>
    
      <MemberForm member={member} setMember={setMember}></MemberForm>
      <Button title="register" onPress={() => addUserToFirestore(member)} />
    </ScrollView>
  );
};

async function addUserToFirestore(user: MemberInfoParam) {
  try {
    // 1. 문서 참조 생성 (자동 ID 포함)
    const userRef = firestore().collection('users').doc();

    // 2. user 객체에 ID 포함
    const userWithId = {
      ...user,
      id: userRef.id,
    };

    // 3. 저장
    await userRef.set(userWithId);

    console.log('게시글이 Firestore에 저장되었습니다.');
  } catch (error) {
    console.error('Firestore 저장 중 오류 발생:', error);
  }
}

export default RegisterScreen;
