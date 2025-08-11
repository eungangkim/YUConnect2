import { Button, ScrollView } from 'react-native';
import { useState } from 'react';

import type { MemberInfoParam } from '../types/memberInfo'; // 타입 경로는 상황에 맞게
import MemberForm from '../components/MemberForm';
import { useNavigation } from '@react-navigation/native';
import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { addUserToFirestore } from '../firebase/firestoreFunctions';

const RegisterScreen = () => {
  const [member, setMember] = useState<MemberInfoParam>({
    id: '',
    name: '',
    sex: true,
    email: '',
    tel: '',
    birth: '',
    images: [],
    mbti: '',
    interest: { interests: {}, detailedInterests: {} },
    forLove: false,
    forFriendship: false,
    mannerDegree: 50,
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



export default RegisterScreen;
