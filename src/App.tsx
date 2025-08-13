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
  getFCMToken,
  onMessageReceived,
  registerMessageHandler,
  requestUserPermission,
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
    // 🔒 권한 요청 & 첫 토큰 저장
    requestUserPermission();
    getFCMToken();
    registerMessageHandler();
    // 🔁 토큰 변경 감지 & 업데이트
    const unsubscribe = messaging().onTokenRefresh(newToken => {
      console.log('🔄 토큰 갱신됨:', newToken);
      saveFCMTokenToFirestore(newToken); // Firestore나 서버에 저장
    });
    messaging().onMessage(async remoteMessage =>
      onMessageReceived(remoteMessage),
    ); // 활성 상태 및 포그라운드 상태일때 FCM 메시지 수신

    //deletePostsWithInvalidUser();

    /*
    const addDocs = async () => {
      for (const data of posts) {
        const docRef = await firestore().collection('posts').add(data);

        // 2) 문서 ID 얻기
        const generatedId = docRef.id;

        // 3) 문서 필드에 id 저장
        await docRef.update({ id: generatedId });
      }
      console.log('문서 추가 완료');
    };
    addDocs();
  */
    /*
   const addUsers = async () => {
      for (const data of members) {
        const docRef = await firestore().collection('users').add(data);

        // 2) 문서 ID 얻기
        const generatedId = docRef.id;

        // 3) 문서 필드에 id 저장
        await docRef.update({ id: generatedId });
      }
      console.log('문서 추가 완료');
    };
    addUsers();
    */

    return unsubscribe; // 언마운트 시 정리
  }, []);
  const user = auth().currentUser;
  if (!user) guestLogin();
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
