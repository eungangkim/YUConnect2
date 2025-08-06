import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack";


import { RootStackParamList } from "../types/navigation";
import { Text, View } from "react-native";


const PostCreationScreen = () => {
  const navigation =useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View>
        <Text>게시글 작성 화면</Text>
    </View>
  )
}

export default PostCreationScreen;