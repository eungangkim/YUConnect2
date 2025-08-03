import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import GoogleLogin from '../components/GoogleLogin';

export default function EmailLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력하세요.');
      return;
    }

    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email.trim(), password);
      Alert.alert('성공', '로그인 성공!');
      // 로그인 성공 후 처리 (예: 화면 전환)
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('오류', '등록된 사용자가 없습니다.');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('오류', '비밀번호가 틀렸습니다.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('오류', '유효하지 않은 이메일 형식입니다.');
      } else {
        Alert.alert('오류', error.message);
      }
    }
    setLoading(false);
  };

  const onRegister = async () => {
    if (!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력하세요.');
      return;
    }

    setLoading(true);
    try {
      await auth().createUserWithEmailAndPassword(email.trim(), password);
      Alert.alert('성공', '회원가입 완료! 자동 로그인 되었습니다.');
      // 회원가입 성공 후 처리
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('오류', '이미 등록된 이메일입니다.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('오류', '유효하지 않은 이메일 형식입니다.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('오류', '비밀번호가 너무 약합니다.');
      } else {
        Alert.alert('오류', error.message);
      }
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>이메일 로그인</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />
      <Button title={loading ? '처리 중...' : '로그인'} onPress={onLogin} disabled={loading} />
      <View style={{ height: 10 }} />
      <Button title={loading ? '처리 중...' : '회원가입'} onPress={onRegister} disabled={loading} />
      <GoogleLogin></GoogleLogin>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
  },
});
