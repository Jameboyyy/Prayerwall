import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, StackNavigationProp } from '@react-navigation/native-stack';
import Backendless from 'backendless';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import Auth from './auth/auth'; // Ensure path is correct

type RootStackParamList = {
  UserFeed: undefined;
  Account: { ownerId: string };
  Auth: undefined;
}


export type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Account'>;

const Stack = createNativeStackNavigator<RootStackParamList>();

// Function to load fonts
const fetchFonts = () => {
  return Font.loadAsync({
    'JosefinSans-Regular': require('./fonts/JosefinSans-Regular.ttf'),
    'JosefinSans-Italic': require('./fonts/JosefinSans-Italic.ttf'),
    'JosefinSans-Bold': require('./fonts/JosefinSans-Bold.ttf'),
    // Include any other fonts here
  });
};

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={{ fontFamily: 'OpenSans-Regular' }}>Welcome to the App!</Text>
    </View>
  );
};

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    Backendless.initApp('98E9F92E-70F6-5F4D-FF47-A45B6253CB00', 'D9AC34A2-9620-4BFB-9219-C4C640887E28');
    fetchFonts().then(() => setFontLoaded(true)).catch(error => console.error(error));
  }, []);

  if (!fontLoaded) {
    return <View style={styles.loaderContainer}><ActivityIndicator size="large" /></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={Auth} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
