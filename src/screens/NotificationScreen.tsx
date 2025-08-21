import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  addChatToFirestore,
  getCollection,
  getDocRefWithCollectionAndId,
} from '../firebase/firestoreFunctions';
import { auth, firestore } from '../firebase';
import { notificationInfo } from '../types/notificationInfo';
import {
  handleChatRequest,
  sendNotification,
} from '../firebase/messageingSetup';

const NotificationScreen = () => {
  const user = auth().currentUser;
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;

    const unsubscribe = firestore()
      .collection(`users/${user.uid}/notifications`)
      .orderBy('createAt', 'desc')
      .onSnapshot(snapshot => {
        setLoading(true);
        const notificationList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createAt: data.createAt || {
              _seconds: Date.now() / 1000,
              _nanoseconds: 0,
            },
          };
        });
        setNotifications(notificationList);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);
  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }
  if (notifications.length == 0) {
    return <Text>알림이 없습니다.</Text>;
  }
  return (
    <View>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          return (
            <View style={styles.container}>
              <View style={styles.titleContainer}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text>{formatDate(item.createAt)}</Text>
              </View>
              <Text style={styles.notificationBody}>{item.body}</Text>
              {item.type === 'chat_request' &&
                (item.status === 'pending' ? (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => {
                        handleChatRequest(item, 'reject');
                      }}
                    >
                      <Text>거절</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => {
                        handleChatRequest(item, 'accept');
                      }}
                    >
                      <Text>수락</Text>
                    </TouchableOpacity>
                  </View>
                ) : item.status === 'accept' ? (
                  <View style={styles.button}>
                    <Text>수락함</Text>
                  </View>
                ) : (
                  <View style={styles.button}>
                    <Text>거절함</Text>
                  </View>
                ))}
            </View>
          );
        }}
      />
    </View>
  );
};

export default NotificationScreen;

function formatDate(timestamp: { _seconds: number; _nanoseconds: number }) {
  const date = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1e6);

  // UTC+9 적용
  date.setHours(date.getHours() + 9);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    margin: 10,
    backgroundColor: '#eae5e5ff',
    borderRadius: 10,
  },
  titleContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  notificationTitle: { fontSize: 18, paddingVertical: 10 },
  notificationBody: { fontSize: 16, marginLeft: 30, marginVertical: 10 },
  buttonContainer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#ffffffe1',
    flex: 1,
    padding: 8,
    marginHorizontal: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
});
