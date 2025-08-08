import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { auth, firestore } from '../firebase';
import { PostInfoParam } from '../types/postInfo';
import style from "../styles/components/PostList";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

const PostList = () => {
  const [posts, setPosts] = useState<PostInfoParam[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth().currentUser;

  const navigation =useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useEffect(() => {
    if (!currentUser) return;

    const userPostsQuery = firestore()
      .collection('posts')
      .where('authorUid', '==', currentUser.uid);

    userPostsQuery
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          console.log('해당 사용자의 게시글이 없습니다.');
          setPosts([]);
        } else {
          const postArray: PostInfoParam[] = [];
          snapshot.forEach(doc => {
            const data = doc.data() as PostInfoParam;
            postArray.push({ ...data });
          });
          setPosts(postArray);
        }
      })
      .catch(err => {
        console.error('게시글 조회 중 오류 발생', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser]);

  if (loading) {
    return <Text>게시글 불러오는 중...</Text>;
  }

  if (posts.length === 0) {
    return <Text>게시글이 없습니다.</Text>;
  }

  return (
    <ScrollView style={style.container} nestedScrollEnabled={true}>
      {posts.map((post:PostInfoParam) => (
        <TouchableOpacity key={post.id} style={style.post} onPress={()=>navigation.navigate("PostEdit",{post})}>
          <Text>제목: {post.title}</Text>
          <Text>내용: {post.description}</Text>
          {/* post 데이터에 맞게 필드 표시 */}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default PostList;
