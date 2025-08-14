import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { MemberInfoParam } from './memberInfo';
import { PostInfoParam } from './postInfo';

export type RootStackParamList = {
  Home: undefined;
  Example: undefined;
  매칭: {
    id: number;
    name: string;
  };
  Login: undefined;
  Register: { user?: FirebaseAuthTypes.User };
  UserInfo: undefined;
  알림: undefined;
  게시글작성: undefined;
  PostList: undefined;
  PostEdit: { post: PostInfoParam };
  SinglePost: { post: PostInfoParam };
  ChatList: undefined;
  Chat: { chatId: string; title: string };
};
