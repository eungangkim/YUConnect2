/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StyleSheet, useColorScheme, View } from 'react-native';
import { useEffect } from 'react';

import StackNavigator from './navigation/StackNavigator';
import {
  initNotifications,
  saveFCMTokenToFirestore,
} from './firebase/messageingSetup';
import { auth } from './firebase';
import { guestLogin } from './firebase/AuthenticationFunction';
import Toast from 'react-native-toast-message';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  useEffect(() => {
    let isMounted = true;
    if (!auth().currentUser) {
      guestLogin().catch(err => console.error('게스트 로그인 실패:', err));
    }
    initNotifications(saveFCMTokenToFirestore);

    return () => {
      isMounted = false;
    };
  }, []);
  const user = auth().currentUser;
  if (!user) {
    guestLogin();
  }
  return (
    <View style={styles.container}>
      <StackNavigator />
      <Toast/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
