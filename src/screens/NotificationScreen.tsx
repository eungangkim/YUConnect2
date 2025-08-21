import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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

  useEffect(() => {
    async function fetch() {
      try {
        const notifications = await getCollection(
          `users/${user?.uid}/notifications`,
        );
        const notificationList = notifications.map(doc => ({ ...doc.data() }));

        notificationList.sort((a, b) => {
          return b.createAt.toMillis() - a.createAt.toMillis();
        });

        console.log('알림 리스트:', notificationList);

        setNotifications(notificationList);
      } catch (error) {
        console.log('fetch실패,', error);
      }
    }
    fetch();
  }, []);

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
              {item.type === 'chat_request' && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleChatRequest(item, 'reject')}
                  >
                    <Text>거절</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleChatRequest(item, 'accept')}
                  >
                    <Text>수락</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

export default NotificationScreen;

function formatDate(timestamp: { _seconds: number; _nanoseconds: number }) {
  const date = new Date(
    timestamp._seconds * 1000 + timestamp._nanoseconds / 1e6,
  );

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
