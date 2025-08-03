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
    </View>
  );
};

export default HomeScreen;
