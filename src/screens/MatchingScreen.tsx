// react-native-reanimated + react-native-gesture-handler
import React, { useEffect, useState } from 'react';
import {
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

import { MatchingScreenStyle } from '../styles/screens/MatchingScreen';
import ImageWindow from '../components/ImageWindow';
import { onPostParticipate } from '../firebase/messageingSetup';
import { firestore } from '../firebase/index';
import { MemberInfoParam } from '../types/memberInfo';
import { PostInfoParam } from '../types/postInfo';

const height = Dimensions.get('window').height;

export const MatchingScreen = () => {
  const [currentPageState, setCurrentPageState] = useState(0); // React용 상태
  const [selectedImages, setSelectedImages] = useState<Array<string | any>>([]); //현재 ImageWindow에 표시되고 있는 memberInfo.Images 리스트
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<MemberInfoParam[]>([]);

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
  useDerivedValue(() => {
    //useDerivedValue(() => { ... }, [currentPage]) currentPage 값이 변할 때마다 내부 로직 실행됨
    const updatePage = runOnJS(setCurrentPageState); //runOnJS(setCurrentPageState)	JS 스레드에서 실행할 React의 상태 업데이트 함수로 변환
    const updateSelectedImages = runOnJS(setSelectedImages);

    updatePage(currentPage.value);
    const firstUser = posts[currentPage.value]?.userList?.[0];

    if (firstUser) {
      updateSelectedImages(firstUser.images);
    } else {
      updateSelectedImages([]);
    }
  }, [currentPage]);

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
    });
  const getPosts = async () => {
    const snapshot = await firestore().collection('posts').get();
    const postList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPosts(postList);
  };
  useEffect(() => {
    const fetchPostsAndUsers = async () => {
      setLoading(true);
      // 1. posts 불러오기
      const postsSnap = await firestore().collection('posts').get();
      const postsData = postsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PostInfoParam[];
      setPosts(postsData);

      // 2. posts 내 userList에서 모든 유저 id 뽑기
      const allUserIds = postsData.flatMap(post => post.userList.map(u => u));
      const uniqueUserIds = Array.from(new Set(allUserIds));

      // 3. 최대 10개씩 chunk 나누기 (Firestore 'in' 쿼리 제한)
      const chunkSize = 10;
      const fetchedUsers: MemberInfoParam[] = [];

      for (let i = 0; i < uniqueUserIds.length; i += chunkSize) {
        const chunk = uniqueUserIds.slice(i, i + chunkSize);

        const usersSnap = await firestore()
          .collection('users')
          .where(firestore.FieldPath.documentId(), 'in', chunk)
          .get();

        usersSnap.docs.forEach(doc => {
          fetchedUsers.push({ id: doc.id, ...doc.data() } as MemberInfoParam);
        });
      }

      setUsers(fetchedUsers);
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
          {posts.map((item, i) => (
            <View
              key={item.id}
              style={[
                {
                  backgroundColor: item.forLove ? '#e49aceff' : '#ace4f3ff',
                  height: parentHeight,
                },
                MatchingScreenStyle.pageView,
              ]}
            >
              <View style={MatchingScreenStyle.userView}>
                <Text style={MatchingScreenStyle.userText}>
                  참가한 사용자 목록
                </Text>
                <ScrollView horizontal style={MatchingScreenStyle.userListView}>
                  {item.userList.map((id: string,index:number) => {
                    const user = users.find(u => u.id === id);
                    if (user === undefined) {
                      return (
                        <Text key={`missing-user-${index}`}>
                          사용자가 불려오지 못함.
                        </Text>
                      );
                    }
                    return (
                      <TouchableOpacity
                        key={user.id}
                        style={MatchingScreenStyle.userNameTouchable}
                        onPress={() => setSelectedImages(user.images)}
                      >
                        <Text style={MatchingScreenStyle.userNameText}>
                          {user.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <ImageWindow images={selectedImages} />
                <ScrollView
                  style={[
                    MatchingScreenStyle.descriptionView,
                    {
                      backgroundColor: item.forLove ? '#df8ac5ff' : '#96daedff',
                    },
                  ]}
                >
                  <Text style={MatchingScreenStyle.descriptionText}>
                    {item.description}
                  </Text>
                </ScrollView>
                <TouchableOpacity
                  style={MatchingScreenStyle.enterTouchable}
                  onPress={() => onPostParticipate(item.id)}
                >
                  <Text style={MatchingScreenStyle.enterText}>참가하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default MatchingScreen;
