import { useNavigation } from '@react-navigation/native';
import { Button, View } from 'react-native';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const HomeScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View>
      <Button
        title="Example Screen"
        onPress={() => {
          navigation.navigate('Example');
        }}/>
        <Button
        title="매칭화면"
        onPress={() => {
          navigation.navigate('매칭', { id: 1, name: '김은강' });
        }}
      />
      <Button
        title="로그인"
        onPress={() => {
          navigation.navigate('EmailLogin');
        }}/>
    </View>
  );
};

export default HomeScreen;
