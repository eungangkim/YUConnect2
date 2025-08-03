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

const { width, height } = Dimensions.get('window');

function ImageWindow({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  const prevImage = () => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };
  if (!images || images.length === 0) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../assets/noImage.jpg')} // 없는 경우 기본 이미지
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={
          typeof images[currentIndex] === 'string'
            ? { uri: images[currentIndex] }
            : images[currentIndex]
        }
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.buttons}>
        <TouchableOpacity onPress={prevImage}>
          <Image
            source={require('../assets/prev.png')}
            style={{ width: 50, height: 50 }}
          />
        </TouchableOpacity>
        <Text style={{ fontSize: 25 }}>
          {currentIndex + 1}/{images.length}
        </Text>
        <TouchableOpacity onPress={nextImage}>
          <Image
            source={require('../assets/next.png')}
            style={{ width: 50, height: 50 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height: height * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    borderRadius: 10,
    borderWidth: 2,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 20,
    width: '60%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ImageWindow;
