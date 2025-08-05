import HomeScreen from '../screens/HomeScreen';
import { RootStackParamList } from '../types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import ExampleScreen from '../screens/ExampleScreen';
import MatchingScreen
 from '../screens/MatchingScreen';
import NotificationScreen from '../screens/NotificationScreen';
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
      <Stack.Screen
        name="알림"
        component={NotificationScreen}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default StackNavigator;
