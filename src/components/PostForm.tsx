import React from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';

import { PostInfoParam } from '../types/postInfo';
import { styles } from '../styles/components/PostForm';

type Props = {
  post: PostInfoParam;
  setPost: React.Dispatch<React.SetStateAction<PostInfoParam>>;
};

export default function PostForm({ post, setPost }: Props) {
  // 필드별 업데이트 헬퍼
  const setField = (field: keyof PostInfoParam, value: any) => {
    setPost(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View>
      <Text>제목</Text>
      <TextInput
        style={styles.input}
        value={post.title}
        onChangeText={val => setField('title', val)}
        placeholder="제목"
      />
      <Text>내용</Text>
      <TextInput
        style={styles.input}
        value={post.description}
        onChangeText={val => setField('description', val)}
        placeholder="여기에 내용을 입력하세요."
      />
      <Text>연애 목적</Text>
      <Switch
        value={post.forLove}
        onValueChange={val => setField('forLove', val)}
      />
      <Text>친구 목적</Text>
      <Switch
        value={post.forFriendship}
        onValueChange={val => setField('forFriendship', val)}
      />
      <Text>최대 인원 : {post.maxUserCount}</Text>
      <Slider
        minimumValue={2}
        maximumValue={10}
        step={1}
        value={post.maxUserCount}
        onValueChange={(val)=>setField('maxUserCount',val)}
      />
    </View>
  );
}


