import { RouteProp, useRoute } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';

import { Post } from '../../components/Post';
import { RootStackParamList } from '../../types/navigation';
import style from "../../styles/screens/SinglePostScreen";

type SinglePostRouteProp = RouteProp<RootStackParamList, 'SinglePost'>;

const SinglePostScreen = () => {
  const route = useRoute<SinglePostRouteProp>();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
                      <View style={style.pageView}>
        
      <Post post={route.params.post}></Post>
      </View>
    </GestureHandlerRootView>
  );
};

export default SinglePostScreen;
