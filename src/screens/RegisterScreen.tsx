import { Alert, Button, ScrollView } from 'react-native';
import { useState } from 'react';

import type { MemberInfoParam } from '../types/memberInfo'; // 타입 경로는 상황에 맞게
import MemberForm from '../components/MemberForm';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { addUserToFirestore } from '../firebase/firestoreFunctions';
import {
  signUpWithEmail,
  signUpWithGoogleEmail,
} from '../firebase/AuthenticationFunction';

type RegisterRouteProp = RouteProp<RootStackParamList, 'Register'>;

const RegisterScreen = () => {
  const route = useRoute<RegisterRouteProp>();
  const user = route.params.user;
  const [member, setMember] = useState<MemberInfoParam>(
    user
      ? {
          id: user.uid,
          name: user.displayName ? user.displayName : '',
          sex: true,
          email: user.email ? user.email : '',
          tel: user.phoneNumber ? user.phoneNumber : '',
          birth: '',
          images: [],
          mbti: '',
          interest: { interests: {}, detailedInterests: {} },
          forLove: false,
          forFriendship: false,
          mannerDegree: 50,
          tokens: [],
        }
      : {
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
        },
  );
  const [password, setPassword] = useState(user ? 'false' : '');
  const [loading, setLoading] = useState(false);

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
        title={loading ? '처리 중...' : 'register'}
        onPress={() => {
          if (!member.email || !password) {
            Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력하세요.');
            return;
          }
          if (password !== 'false' && password.length < 6) {
            Alert.alert(
              '비밀번호 오류',
              '비밀번호는 최소 6자 이상이어야 합니다.',
            );
            return;
          }

          user
            ? (Alert.alert('성공', '가입 완료! 자동 로그인 되었습니다..'),
              signUpWithGoogleEmail(member, password),
              navigation.replace('Home'))
            : (Alert.alert('성공', '가입 완료! 이메일 인증 후 로그인하세요.'),
              signUpWithEmail(member, password),
              navigation.replace('Login'));
        }}
        disabled={loading}
      />
    </ScrollView>
  );
};

export default RegisterScreen;
