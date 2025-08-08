// react-native-reanimated + react-native-gesture-handler
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useDerivedValue,
} from 'react-native-reanimated';
import {
  GestureDetector,
  GestureHandlerRootView,
  Gesture,
  ScrollView,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import ImageWindow from '../components/ImageWindow';
import { onPostParticipate } from '../firebase/messageingSetup';
import { firestore } from '../firebase/index';
import { MemberInfoParam } from '../types/memberInfo';
import { PostInfoParam } from '../types/postInfo';
import { Post } from '../components/Post';
import style from '../styles/screens/MatchingScreen';

const height = Dimensions.get('window').height;

export const MatchingScreen = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const insets = useSafeAreaInsets();
  const usableHeight = height - insets.top - insets.bottom; //navigation의 header의 크기를 빼기 위해 inset 사용(사용해도 잘리는 문제 해결 안됨)

  const translateY = useSharedValue(0); //현재 페이지의 Y값
  const currentPage = useSharedValue(0); //현재 페이지 인덱스
  const [parentHeight, setParentHeight] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setParentHeight(height);
  };

  const gesture = Gesture.Pan()
    .onUpdate(e => {
      translateY.value = e.translationY + -currentPage.value * parentHeight;
    })
    .onEnd(() => {
      if (
        translateY.value >
        -currentPage.value * parentHeight + parentHeight / 3
      ) {
        // 스와이프가 아래로 많이 됐으면 이전 페이지로
        currentPage.value = Math.max(0, currentPage.value - 1);
      } else if (
        translateY.value <
        -currentPage.value * parentHeight - parentHeight / 3
      ) {
        // 스와이프가 위로 많이 됐으면 다음 페이지로
        currentPage.value = Math.min(posts.length - 1, currentPage.value + 1);
      }
      translateY.value = withSpring(-currentPage.value * parentHeight);
      console.log(currentPage);
    });
  const savePosts = async () => {
    const snapshot = await firestore().collection('posts').get();
    const postList = snapshot.docs.map(doc => ({
      ...doc.data(),
    }));
    setPosts(postList);
  };
  useEffect(() => {
    const fetchPostsAndUsers = async () => {
      setLoading(true);
      // 1. posts 불러오기
      await savePosts();

      
      setLoading(false);
    };

    fetchPostsAndUsers();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const navigation = useNavigation();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          onLayout={handleLayout}
          style={[{ flex: 1 }, animatedStyle]}
        >
          {posts.map((post: PostInfoParam) => {
            
            if (loading) {
              return (
                <View
                  key={post.id}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ActivityIndicator size="large" color="#007BFF" />
                </View>
              );
            }
              
            return (
              <View key={post.id} style={style.pageView}>
                <Post
                  post={post}
                ></Post>
              </View>
            );
          })}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default MatchingScreen;
