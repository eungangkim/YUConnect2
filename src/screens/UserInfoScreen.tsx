// screens/UserInfoScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/navigation';
import style from  "../styles/screens/UserInfoScreen";
type Props = NativeStackScreenProps<RootStackParamList, 'UserInfo'>;

export default function UserInfoScreen({ navigation }: Props) {
  const user = auth().currentUser;

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('EmailLogin');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <View style={style.container}>
      <Text style={style.title}>👤 로그인된 사용자 정보</Text>
      {user ? (
        <>
          <Text>이메일: {user.email}</Text>
          <Text>UID: {user.uid}</Text>
          <Button title="로그아웃" onPress={handleLogout} />
        </>
      ) : (
        <Text>로그인 정보 없음</Text>
      )}
    </View>
  );
}

