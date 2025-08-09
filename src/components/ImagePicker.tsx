import React, { useState } from 'react';
import { View, Button, Image, StyleSheet } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import ImageWindow from './ImageWindow';
import { MemberInfoParam } from '../types/memberInfo';

type Props = {
  images: string[];
  setMember: React.Dispatch<React.SetStateAction<MemberInfoParam>>;
};

export default function ImagePicker({ images, setMember }: Props) {
  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
      if (response.didCancel) {
        console.log('사용자가 선택 취소');
      } else if (response.errorCode) {
        console.log('에러 발생:', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        if (uri) {
          setImageUri(uri); // 배열 형태로
        }
      }
    });
  };

  const removeImage = (uri: string) => {
    setMember(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== uri), // uri 일치하는 것 제거
    }));
  };
  const setImageUri = (uri: string) => {
    setMember(prev => ({
      ...prev,
      images: [...prev.images, uri],
    }));
  };
  return (
    <View style={styles.container}>
      <Button title="사진 선택" onPress={pickImage} />
      {images.length > 0 && <ImageWindow images={images} onRemove={removeImage}/>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: 200, height: 200, borderRadius: 100, marginTop: 20 },
});
