/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import StackNavigator from './navigation/StackNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
      <View style={styles.container}>
        <StackNavigator />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
