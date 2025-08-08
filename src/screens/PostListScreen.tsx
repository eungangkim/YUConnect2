import { View } from "react-native";

import PostList from "../components/PostList";
import style from "../styles/screens/PostListScreen";;
const PostListScreen = ()=>{
    return(
        <View style={style.container}>
            <PostList></PostList>
        </View>
    )
}

export default PostListScreen;