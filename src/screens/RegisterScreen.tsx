import { Alert, Button, ScrollView } from 'react-native';
import { useState } from 'react';

import type { MemberInfoParam } from '../types/memberInfo'; // 타입 경로는 상황에 맞게
import MemberForm from '../components/MemberForm';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getFCMToken } from '../firebase/messageingSetup';

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
    MannerDegree: 50,
    tokens: [],
  });
  const [password, setPassword] = useState('');
  const [loading,setLoading] =useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView contentContainerStyle={{ padding: 10 }}>
      <MemberForm
        member={member}
        setMember={setMember}
        password={password}
        setPassword={setPassword}
      ></MemberForm>
      <Button
        title={loading? "처리 중...":"register"}
        onPress={() => addUserToFirestore(member, password,navigation)}
        disabled={loading}
      />
    </ScrollView>
  );
};

async function addUserToFirestore(user: MemberInfoParam, password: string,navigation:NativeStackNavigationProp<RootStackParamList>  ) {
  try {
    if (!user.email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력하세요.');
      return;
    }
     if (password.length < 6) {
      Alert.alert('비밀번호 오류', '비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    const newUser = await auth().createUserWithEmailAndPassword(
      user.email.trim(),
      password,
    );
    Alert.alert('성공', '회원가입 완료! 자동 로그인 되었습니다.');
    // 1. 문서 참조 생성 (자동 ID 포함)
    const userRef = firestore().collection('users').doc(newUser.user.uid);

    const newToken=getFCMToken();
    
    // 2. user 객체에 ID 포함
    const userWithId = {
      ...user,
      id: userRef.id,
      tokens:{...user.tokens,token:newToken}
    };

    // 3. 저장
    await userRef.set(userWithId);
    navigation.replace('Home');
    console.log('회원정보가 Firestore에 저장되었습니다.');
  } catch (error) {
    console.error('Firestore 저장 중 오류 발생:', error);
  }
}

export default RegisterScreen;
