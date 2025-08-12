import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../types/navigation';
import { useNavigation } from '@react-navigation/native';
import style from '../../styles/components/login/EmailLogin';
import { firestore } from '../../firebase';
import { getFCMToken } from '../../firebase/messageingSetup';
import { firebase } from '@react-native-firebase/firestore';
import { signIn } from '../../firebase/AuthenticationFunction';

type Props = {
  loading: boolean;
  setLoading: (val: boolean) => void;
};
export default function EmailLogin({ loading, setLoading }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력하세요.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);

      Alert.alert('성공', '로그인 성공!');
      navigation.replace('Home');

      // ✅ FCM 토큰 가져오기 (비동기 처리)
      const token = await getFCMToken();

      // ✅ Firestore 토큰 저장 (배열로 추가)
      const userDocRef = firestore()
        .collection('users')
        .doc(auth().currentUser?.uid);
      await userDocRef.update({
        tokens: firebase.firestore.FieldValue.arrayUnion(token),
      });

      // 로그인 성공 후 처리 (예: 화면 전환)
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('오류', '등록된 사용자가 없습니다.');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('오류', '비밀번호가 틀렸습니다.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('오류', '유효하지 않은 이메일 형식입니다.');
      } else if (error.code === 'EMAIL_NOT_VERIFIED') {
        Alert.alert('오류', '이메일 인증이 필요합니다!');
      } else {
        Alert.alert('오류', error.message);
      }
    }
    setLoading(false);
  };

  return (
    <View>
      <Text style={style.title}>이메일 로그인</Text>
      <TextInput
        style={style.input}
        placeholder="이메일"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />
      <TextInput
        style={style.input}
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />
      <Button
        title={loading ? '처리 중...' : '로그인'}
        onPress={onLogin}
        disabled={loading}
      />
      <View style={{ height: 10 }} />
      <Button
        title={loading ? '처리 중...' : '회원가입'}
        onPress={() => navigation.navigate('Register')}
        disabled={loading}
      />
    </View>
  );
}
