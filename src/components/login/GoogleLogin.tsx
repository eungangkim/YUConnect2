import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { auth, firestore } from '../../firebase';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Icon from 'react-native-vector-icons/FontAwesome'; // 또는 MaterialIcons, Ionicons 등
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../types/navigation';
import style from '../../styles/components/login/GoogleLogin';
import Svg, { Path } from 'react-native-svg';

export default function GoogleLogin({
  loading,
  setLoading,
}: {
  loading: boolean;
  setLoading: (val: boolean) => void;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '914951198011-k8v8uaqu5k05gtheotjmq9a3m5uo1qdu.apps.googleusercontent.com',
    });
  }, []);

  const onGoogleButtonPress = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) throw new Error('No ID token found');

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      const user = userCredential.user;

      // 4. Firestore에서 해당 UID 문서 확인
      const userDoc = await firestore().collection('users').doc(user.uid).get();

      // 5. 문서가 없으면 최초 가입 → 저장
      if (!userDoc.exists) {
        await firestore().collection('users').doc(user.uid).set({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      }
      console.log('최초 가입 - Firestore에 사용자 정보 저장 완료');
      navigation.replace('Home');
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('사용자가 로그인 취소함');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('로그인이 이미 진행 중임');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Google Play 서비스가 사용 불가능함');
      } else {
        console.error('기타 오류:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={style.container}>
      <TouchableOpacity
        style={[style.button, loading && style.disabled]}
        onPress={onGoogleButtonPress}
        disabled={loading}
        activeOpacity={1}
      >
        <View style={style.contentWrapper}>
          <View style={style.icon}>
            <Svg width={20} height={20} viewBox="0 0 48 48" fill="none">
              <Path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <Path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <Path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <Path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </Svg>
          </View>
          <Text style={style.text}>Sign in with Google</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
