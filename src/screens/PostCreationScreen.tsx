import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { PostInfoParam } from "../types/postInfo";
import { RootStackParamList } from "../types/navigation";
import {auth, firestore} from "../firebase"
import PostForm from "../components/PostForm";
import {addPostToFirestore} from "../firebase/firestoreFunctions";
import style from "../styles/screens/PostCreationScreen";

const PostCreationScreen = () => {
  const navigation =useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const author = auth().currentUser;
  if(!author){
    
    return(
      <Text>!!로그인 필요!!</Text>
    );
  }
  const [post,setPost]=useState<PostInfoParam>({
    id: '', //key 값 (고유값)   -> firestore 자동생성
    authorUid:author.uid, //
    title:'',
    forLove: false, //true 라면 연애가 목적인 글
    forFriendship: false, //true 라면 친구가 목적인 글
    description: '', // 사용자가 작성한 글
    userList: [author.uid], //참여된 사용자 배열   -> ''[] 사용자들의 id 저장
    chatRoute: '', //게시글에 참여하면 참가할 수 있는 대화창 주소
    maxUserCount:2,
    images:[],
  });


  return (
    <ScrollView style={style.container}>
      <PostForm post={post} setPost={setPost}></PostForm>
      <TouchableOpacity onPress={()=>addPostToFirestore(post)} style={style.saveButton}>
        <Text style={style.buttonText}>저장</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

export default PostCreationScreen;