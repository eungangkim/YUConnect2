// screens/UserInfoScreen.tsx
import React from 'react';
import { View, Text, Button, Image, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/navigation';
import style from '../styles/screens/UserInfoScreen';
import {
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import UserInfo from '../components/UserInfo';
import { deleteUserFromFireStore } from '../firebase/firestoreFunctions';
import { guestLogin } from '../firebase/AuthenticationFunction';
type Props = NativeStackScreenProps<RootStackParamList, 'UserInfo'>;

function UserInfoScreen({ navigation }: Props) {
  const user = auth().currentUser;

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <GestureHandlerRootView>
      <UserInfo></UserInfo>

      <View style={style.logout}>
        {user && !user.isAnonymous ? (
          <View>
            <Button
              title="회원탈퇴"
              onPress={() => {
                deleteUserFromFireStore(user.uid);
                guestLogin();
                Alert.alert('회원 탈퇴가 완료되었습니다.');
                navigation.replace('Login');
              }}
            />
            <Button
              title="로그아웃"
              onPress={() => {
                handleLogout();
                guestLogin();
              }}
            />
          </View>
        ) : (
          <Button title="로그인" onPress={() => navigation.replace('Login')} />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={style.row}>
      <Text style={style.label}>{label}</Text>
      <Text style={style.value}>:{value ?? '없음'}</Text>
    </View>
  );
}

export default UserInfoScreen;
