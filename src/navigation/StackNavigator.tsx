import HomeScreen from '../screens/HomeScreen';
import { RootStackParamList } from '../types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import ExampleScreen from '../screens/ExampleScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Example"
        component={ExampleScreen}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default StackNavigator;
