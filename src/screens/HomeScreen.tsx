
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Button,
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { RootStackParamList } from "../types/navigation"; 
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const { height } = Dimensions.get("window");

const HomeScreen= () => {
  const navigation =useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const notices = [
    { id: "1", text: "📢 YU Connect에 오신 것을 환영합니다!" },
    { id: "2", text: "✅ 새로운 매칭 기능이 업데이트되었어요!" },
    { id: "3", text: "🎉 이번 주말, YU Connect 번개 모임!" },
  ];

  return (
    <View style={styles.container}>
      {/* 상단 */}
            <Button title="로그인 화면" onPress={()=> navigation.navigate("Login")}/>

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("게시글작성")}
        >
          <FontAwesome name="plus" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>YU Connect</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("알림")}
        >
          <Ionicons name="notifications-outline" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      {/* 중간 (공지사항) */}
      <View style={styles.noticeBox}>
        <FlatList
          data={notices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text style={styles.noticeText}>{item.text}</Text>
          )}
        />
      </View>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.friendButton}
          onPress={() => navigation.navigate("매칭",{name:"김은강",id:1})}
        >
          <Text style={styles.footerText}>👫 친구 매칭</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  header: {
    height: height / 7,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  notificationButton: { position: "absolute", right: 20 },
  noticeBox: {
    height: (height / 7) * 5,
    margin: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    backgroundColor: "#fff",
  },
  noticeText: { fontSize: 16, paddingVertical: 5 },
  footer: {
    height: height / 7,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  friendButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  loveButton: {
    backgroundColor: "#E91E63",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  footerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});