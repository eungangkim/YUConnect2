import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Button,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import style from '../styles/components/ImageWindow';
import { getDownloadURL } from '../firebase/StorageFunctions';
const { width, height } = Dimensions.get('window');

type Props = {
  images: string[];
  onRemove?: (uri: string) => void; // ?로 선택적 props
};

function ImageWindow({ images, onRemove }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    setCurrentIndex(0);
    async function fetchUrls() {
      const urls = await Promise.all(images.map(path => getDownloadURL(path)));
      setImageUrls(urls);
    }
    fetchUrls();
  }, [images]);

  const prevImage = () => {
    setCurrentIndex(prev => (prev <= 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex(prev => (prev >= images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) {
    return (
      <View style={[style.container, { width, height: height * 0.5 }]}>
        <Image
          // 없는 경우 기본 이미지
          style={[
            style.image,
            {
              width: width * 0.8,
              height: height * 0.4,
            },
          ]}
          resizeMode="contain"
        />
        <View style={style.buttons}>
          <TouchableOpacity>
            <Icon name="arrow-back-outline" size={20} />
          </TouchableOpacity>
          <Text style={{ fontSize: 25 }}>
            {currentIndex}/{images.length}
          </Text>
          <TouchableOpacity>
            <Icon name="arrow-forward-outline" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[style.container, { width, height: height * 0.5 }]}>
      <Image
        source={
          typeof images[currentIndex] === 'string'
            ? { uri: imageUrls[currentIndex] }
            : require('../assets/noImage.jpg')
        }
        style={[
          style.image,
          {
            width: width * 0.8,
            height: height * 0.4,
          },
        ]}
        resizeMode="cover"
      />
      {onRemove && ( // onRemove가 있을 때만 삭제 버튼 렌더링
        <TouchableOpacity
          style={style.deleteBtn}
          onPress={() => onRemove(images[currentIndex])}
        >
          <Text style={style.deleteText}>×</Text>
        </TouchableOpacity>
      )}
      <View style={style.buttons}>
        <TouchableOpacity onPress={prevImage}>
          <Icon name="arrow-back-outline" size={20} />
        </TouchableOpacity>
        <Text style={{ fontSize: 25 }}>
          {currentIndex + 1}/{images.length}
        </Text>
        <TouchableOpacity onPress={nextImage}>
          <Icon name="arrow-forward-outline" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ImageWindow;
