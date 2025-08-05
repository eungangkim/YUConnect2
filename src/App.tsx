/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';

import StackNavigator from './navigation/StackNavigator';
import { getFCMToken, registerMessageHandler, requestUserPermission,saveFCMTokenToFirestore } from './firebase/messageingSetup';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  useEffect(() => {
    // 🔒 권한 요청 & 첫 토큰 저장
    requestUserPermission();
    getFCMToken();
    registerMessageHandler();

    // 🔁 토큰 변경 감지 & 업데이트
    const unsubscribe = messaging().onTokenRefresh(newToken => {
      console.log('🔄 토큰 갱신됨:', newToken);
      saveFCMTokenToFirestore(newToken); // Firestore나 서버에 저장
    });

    return unsubscribe; // 언마운트 시 정리
  }, []);
  return (
      <View style={styles.container}>
        <StackNavigator />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
