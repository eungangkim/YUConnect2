import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const NotificationScreen: React.FC = () => {
  const notifications = [
    { id: "1", text: "📬 새로운 친구 요청이 도착했어요!" },
    { id: "2", text: "💌 연인 매칭 결과가 업데이트되었습니다." },
    { id: "3", text: "🎉 이번 주말 이벤트 알림" },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.notificationText}>{item.text}</Text>
        )}
      />
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  notificationText: { fontSize: 16, paddingVertical: 10 },
});