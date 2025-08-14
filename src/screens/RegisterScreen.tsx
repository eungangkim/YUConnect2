import { Alert, Button, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';

import type { MemberInfoParam } from '../types/memberInfo'; // 타입 경로는 상황에 맞게
import MemberForm from '../components/MemberForm';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import {
  addUserToFirestore,
  deleteUserFromFireStore,
} from '../firebase/firestoreFunctions';
import {
  guestLogin,
  signUpWithEmail,
  signUpWithGoogleEmail,
} from '../firebase/AuthenticationFunction';
import { auth } from '../firebase';

const RegisterScreen = () => {
  const user = auth().currentUser;
  const [member, setMember] = useState<MemberInfoParam>(
    user && !user?.isAnonymous
      ? {
          id: user.uid,
          name: user.displayName!,
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
  const [password, setPassword] = useState(user&&!user.isAnonymous ? 'googlePassword' : '');
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (isRegistered || e.data.action.type === 'REPLACE') {
        return; // 등록 완료 혹은 replace 호출이면 알림 무시
      }
      e.preventDefault(); // 화면 이동 일시 중지
      Alert.alert(
        '주의',
        '등록하지 않고 나가면 정보가 사라집니다. 계속하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '나가기',
            style: 'destructive',
            onPress: async () => {
              // 익명 계정 삭제
              if (user) {
                deleteUserFromFireStore(user.uid);
                await guestLogin();
              }
              navigation.dispatch(e.data.action); // 원래 이동 수행
            },
          },
        ],
      );
    });

    return unsubscribe;
  }, [navigation]);
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
        onPress={async () => {
          setLoading(true);
          setIsRegistered(true);
          try {
            if (user && !user.isAnonymous) {
              await signUpWithGoogleEmail(member, password);
              Alert.alert('성공', '가입 완료! 자동 로그인 되었습니다..');
              navigation.replace('Home');
            } else {
              await signUpWithEmail(member, password);
              Alert.alert('성공', '가입 완료! 이메일 인증 후 로그인하세요.');
              navigation.replace('Login');
            }
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
      />
    </ScrollView>
  );
};

export default RegisterScreen;
