import { useEffect, useState } from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Text, TouchableOpacity, View } from 'react-native';


import PostForm from '../components/PostForm';
import { PostInfoParam } from '../types/postInfo';
import { RootStackParamList } from '../types/navigation';
import style from "../styles/screens/PostEditScreen";
import { savePostToFirestore } from '../firebase/firestoreFunctions';

type PostEditRouteProp = RouteProp<RootStackParamList, 'PostEdit'>;

const PostEditScreen = () => {
  const route = useRoute<PostEditRouteProp>();

  const [post, setPost] = useState<PostInfoParam>({
    id: '', //key 값 (고유값)   -> firestore 자동생성
    authorUid: '', //
    title: '',
    forLove: false, //true 라면 연애가 목적인 글
    forFriendship: false, //true 라면 친구가 목적인 글
    description: '', // 사용자가 작성한 글
    userList: [], //참여된 사용자 배열   -> ''[] 사용자들의 id 저장
    chatRoute: '', //게시글에 참여하면 참가할 수 있는 대화창 주소
    maxUserCount: 2,
  });
  useEffect(() => {
    setPost(route.params.post); // 의존성 배열에 count 없으면 계속 호출됨
  }, []);
  return (
    <View>
      <PostForm post={post} setPost={setPost}></PostForm>
      <TouchableOpacity style={style.saveButton} onPress={()=>savePostToFirestore(post)}>
        <Text>저장하기</Text>
      </TouchableOpacity>
    </View>
  );
};



export default PostEditScreen;
