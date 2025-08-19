import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import { RootStackParamList } from '../types/navigation';
import HomeScreen from '../screens/HomeScreen';
import ExampleScreen from '../screens/ExampleScreen';

import MatchingScreen from '../screens/MatchingScreen';
import UserInfoScreen from '../screens/UserInfoScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import NotificationScreen from '../screens/NotificationScreen';
import PostCreationScreen from '../screens/Post/PostCreationScreen';
import PostListScreen from '../screens/Post/PostListScreen';
import PostEditScreen from '../screens/Post/PostEditScreen';
import SinglePostScreen from '../screens/Post/SinglePostScreen';
import ChatListScreen from '../screens/Chat/ChatListScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import ChatEditScreen from '../screens/Chat/ChatEditScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{headerShown:false}}/>
      <Stack.Screen
        name="매칭"
        component={MatchingScreen}
        initialParams={{ id: 1, name: '김은강' }}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Example"
        component={ExampleScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="UserInfo" component={UserInfoScreen} />
      <Stack.Screen name="Register" component={RegisterScreen}/>
      <Stack.Screen
        name="알림"
        component={NotificationScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen name="게시글작성" component={PostCreationScreen}/>
      <Stack.Screen name="PostList" component={PostListScreen}/>
      <Stack.Screen name='PostEdit' component={PostEditScreen} />
      <Stack.Screen name='SinglePost' component={SinglePostScreen}/>
      <Stack.Screen name="ChatList" component={ChatListScreen}/>
      <Stack.Screen name="Chat" component={ChatScreen}/>
      <Stack.Screen name="ChatEdit" component={ChatEditScreen}/>
    </Stack.Navigator>
  </NavigationContainer>
);

export default StackNavigator;
