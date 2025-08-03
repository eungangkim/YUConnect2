import React, { useEffect, useState } from 'react';
import {
  Button,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Icon from 'react-native-vector-icons/FontAwesome'; // 또는 MaterialIcons, Ionicons 등

export default function GoogleLogin() {
  const [loading, setLoading] = useState(false);

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
      await auth().signInWithCredential(googleCredential);

      console.log('User signed in!');
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
    <View>
      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={onGoogleButtonPress}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Google Sign-In</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onGoogleButtonPress}>
        <Icon name="google" size={24} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Google Sign-In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
