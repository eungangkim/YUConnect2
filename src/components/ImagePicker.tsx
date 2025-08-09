import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, Text } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import {
  deleteImageFromStorage,
  uploadImageToStoarage,
} from '../firebase/StorageFunctions';

import ImageWindow from './ImageWindow';
import { MemberInfoParam } from '../types/memberInfo';
import { PostInfoParam } from '../types/postInfo';
import style from '../styles/components/ImagePicker';

type Props = {
  images: string[];
  setMember?: React.Dispatch<React.SetStateAction<MemberInfoParam>>;
  setPost?: React.Dispatch<React.SetStateAction<PostInfoParam>>;
};

export default function ImagePicker({ images, setMember, setPost }: Props) {
  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
      if (response.didCancel) {
        console.log('사용자가 선택 취소');
      } else if (response.errorCode) {
        console.log('에러 발생:', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri; //ImagePicker가 자동으로 고유한 uri를 만듬
        if (uri) {
          setImageUri(uri); // 배열 형태로
        }
      }
    });
  };
  const removeImage = async (uri: string) => {
    await deleteImageFromStorage(uri);
    if (setMember) {
      setMember(prev => ({
        ...prev,
        images: prev.images.filter(img => img !== uri), // uri 일치하는 것 제거
      }));
    }
    if (setPost) {
      setPost(prev => ({
        ...prev,
        images: prev.images.filter(img => img !== uri), // uri 일치하는 것 제거
      }));
    }
  };
  const setImageUri = async (uri: string) => {
    try {
      if (setMember) {
        const path = await uploadImageToStoarage(uri, 'profileImages');
        setMember(prev => ({
          ...prev,
          images: [...prev.images, path], // Storage URL 저장
        }));
      }
      if (setPost) {
        const path = await uploadImageToStoarage(uri, 'postImages');
        setPost(prev => ({
          ...prev,
          images: [...prev.images, path], // Storage URL 저장
        }));
      }
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
    }
  };
  return (
    <View style={style.container}>
      <Button title="사진 선택" onPress={pickImage} />
      {images.length > 0 && (
        <ImageWindow images={images} onRemove={removeImage} />
      )}
    </View>
  );
}
