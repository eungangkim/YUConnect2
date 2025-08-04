import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import { RootStackParamList } from '../types/navigation';
import HomeScreen from '../screens/HomeScreen';
import ExampleScreen from '../screens/ExampleScreen';
import MatchingScreen from '../screens/MatchingScreen';
import UserInfoScreen from '../screens/UserInfoScreen';
import LoginScreen from '../screens/LoginScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
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
    </Stack.Navigator>
  </NavigationContainer>
);

export default StackNavigator;
