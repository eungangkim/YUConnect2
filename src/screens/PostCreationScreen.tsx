import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { PostInfoParam } from "../types/postInfo";
import { RootStackParamList } from "../types/navigation";
import {auth, firestore} from "../firebase"
import PostForm from "../components/PostForm";
import { addDoc, collection, doc, setDoc } from "@react-native-firebase/firestore";

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
  });


  return (
    <View>
      <PostForm post={post} setPost={setPost}></PostForm>
      <TouchableOpacity onPress={()=>addPostToFirestore(post)}>
        <Text>저장</Text>
      </TouchableOpacity>
    </View>
  )
}
async function addPostToFirestore(post: PostInfoParam) {
  try {
    // 1. 문서 참조 생성 (자동 ID 포함)
    const postRef = firestore().collection('posts').doc();

    // 2. post 객체에 ID 포함
    const postWithId = {
      ...post,
      id: postRef.id,
    };

    // 3. 저장
    await postRef.set(postWithId);

    console.log('게시글이 Firestore에 저장되었습니다.');
  } catch (error) {
    console.error('Firestore 저장 중 오류 발생:', error);
  }
}
export default PostCreationScreen;