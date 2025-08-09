import { StyleSheet } from "react-native";
import { Post } from "../../components/Post";

const PostCreationScreenStyles =StyleSheet.create({
    container:{
        flex:1,
    },
    saveButton:{
        alignItems:"flex-end",
        flex:1,
    },
    buttonText:{
        padding:5,
        marginBottom:20,
        paddingHorizontal:15,
        borderWidth:2,
        marginHorizontal:10,
    },
});

export default PostCreationScreenStyles;