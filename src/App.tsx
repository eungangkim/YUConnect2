/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { useEffect } from 'react';

import StackNavigator from './navigation/StackNavigator';
import {
  initNotifications,
  saveFCMTokenToFirestore,
} from './firebase/messageingSetup';
import { members, posts } from './data/data';
import { auth, firestore, messaging } from './firebase';
import { deletePostsWithInvalidUser } from './firebase/firestoreFunctions';
import { guestLogin } from './firebase/AuthenticationFunction';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
