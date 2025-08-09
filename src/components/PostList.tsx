import React, { useEffect, useRef, useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { auth, firestore } from '../firebase';
import { PostInfoParam } from '../types/postInfo';
import style from '../styles/components/PostList';
import { RootStackParamList } from '../types/navigation';
import { deletePostFromFirestore } from '../firebase/firestoreFunctions';

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
} | null;

const PostList = () => {
  const [posts, setPosts] = useState<PostInfoParam[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisibleFor, setModalVisibleFor] = useState<string | null>(null);

  const currentUser = auth().currentUser;

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
  }, [currentUser,posts]);

  if (loading) {
    return <Text>게시글 불러오는 중...</Text>;
  }

  if (posts.length === 0) {
    return <Text>게시글이 없습니다.</Text>;
  }

  return (
    <ScrollView style={style.container} nestedScrollEnabled={true}>
      {posts.map((post: PostInfoParam) => (
        <View key={post.id} style={style.row}>
          <TouchableOpacity
            style={style.post}
            onPress={() => navigation.navigate('SinglePost', { post })}
          >
            <Text>제목: {post.title}</Text>
            <Text numberOfLines={1} ellipsizeMode="tail">
              내용: {post.description}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={style.option}
            onPress={() => setModalVisibleFor(post.id)}
          >
            <Icon name="options-vertical" size={30} />
          </TouchableOpacity>

          {modalVisibleFor === post.id && (
            <Modal
              transparent
              visible={true}
              animationType="fade"
              onRequestClose={() => setModalVisibleFor(null)}
            >
              <TouchableOpacity
                style={style.modalBackground}
                activeOpacity={1}
                onPressOut={() => setModalVisibleFor(null)}
              >
                <View style={style.modalContent}>
                  <TouchableOpacity
                    onPress={() => {
                      // Edit 액션 처리
                      setModalVisibleFor(null);
                      navigation.navigate('PostEdit', { post });
                    }}
                    style={style.modalButton}
                  >
                    <Text style={style.modalButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      deletePostFromFirestore(post);
                    }}
                    style={style.modalButton}
                  >
                    <Text style={style.modalButtonText}>Delete</Text>
                  </TouchableOpacity>
                  {/* 추가 버튼들 필요하면 여기 */}
                </View>
              </TouchableOpacity>
            </Modal>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

export default PostList;
