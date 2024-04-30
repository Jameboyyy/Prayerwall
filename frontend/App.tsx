import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppNavigator from './navigation/appNavigator';
import { useFonts } from 'expo-font';
import './firebaseConfig';

export default function App() {
  const [fontsLoaded] = useFonts({
    'JosefinSans-Regular': require('./fonts/JosefinSans-Regular.ttf'),
    'JosefinSans-Bold': require('./fonts/JosefinSans-Bold.ttf'),
    'JosefinSans-Italic': require('./fonts/JosefinSans-Italic.ttf'),
  });

  if (!fontsLoaded) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }
  console.log('App is rendering');  // Check if this logs in your console
  return (
    <View style={styles.container}>
      <AppNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
