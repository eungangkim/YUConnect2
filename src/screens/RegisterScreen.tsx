import { doc, setDoc } from 'firebase/firestore';
import { Button, ScrollView, View } from 'react-native';

import { db } from '../firebase/firebaseConfig';
import type { MemberInfoParam } from '../types/memberInfo'; // 타입 경로는 상황에 맞게
import { members } from '../data/data';
import MemberForm from '../components/memberForm';
import { useState } from 'react';

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
    // id를 문서 ID로 사용 (고유 번호)
    const userRef = doc(db, 'users', user.id);

    // Firestore에 문서 추가 또는 덮어쓰기
    await setDoc(userRef, user);

    console.log('회원 정보가 Firestore에 저장되었습니다.');
  } catch (error) {
    console.error('Firestore 저장 중 오류 발생:', error);
  }
}

export default RegisterScreen;
