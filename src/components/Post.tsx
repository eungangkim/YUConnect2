import { Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import ImageWindow from './ImageWindow';
import { PostInfoParam } from '../types/postInfo';
import style from '../styles/components/Post';
import { onPostParticipate } from '../firebase/messageingSetup';
import { MemberInfoParam } from '../types/memberInfo';
import { runOnJS, SharedValue, useDerivedValue } from 'react-native-reanimated';
import { useState } from 'react';

type Props = {
  post: PostInfoParam;
  users: MemberInfoParam[];
  currentPage: SharedValue<number>;
  loading: boolean;
};

export const Post = ({ post, users, currentPage, loading }: Props) => {
  const [selectedImages, setSelectedImages] = useState<{ uri: string }[]>([]); //현재 ImageWindow에 표시되고 있는 memberInfo.Images 리스트

  useDerivedValue(() => {
    //useDerivedValue(() => { ... }, [currentPage]) currentPage 값이 변할 때마다 내부 로직 실행됨
    const updateSelectedImages = runOnJS(setSelectedImages);

    const firstUser = users?.[0];

    if (firstUser) {
      updateSelectedImages(firstUser.images);
    } else {
      updateSelectedImages([]);
    }
  }, [currentPage]);
  return (
    <View
      style={[
        {
          backgroundColor: post.forLove ? '#e49aceff' : '#ace4f3ff',
        },
        style.pageView,
      ]}
    >
      <View style={style.userView}>
        <Text style={style.userText}>참가한 사용자 목록</Text>
        <ScrollView horizontal style={style.userListView}>
          {post.userList.map((id: string, index: number) => {
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
                style={style.userNameTouchable}
                onPress={() => setSelectedImages(user.images)}
              >
                <Text style={style.userNameText}>{user.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ImageWindow images={selectedImages} />
        <ScrollView
          style={[
            style.descriptionView,
            {
              backgroundColor: post.forLove ? '#df8ac5ff' : '#96daedff',
            },
          ]}
        >
          <Text style={style.descriptionText}>{post.description}</Text>
        </ScrollView>
        <TouchableOpacity
          style={style.enterTouchable}
          onPress={() => onPostParticipate(post.id)}
        >
          <Text style={style.enterText}>참가하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
