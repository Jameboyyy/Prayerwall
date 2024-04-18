import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigationTypes';
import Backendless from 'backendless';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import Auth from './auth/auth'; // Ensure this path is correct
import Account from './auth/account'; // Ensure this path is correct
import MainTab from './tabs/mainTab'; // Ensure this path is correct
import { enableScreens } from 'react-native-screens';
enableScreens();

// Define the type for the root stack parameters

const Stack = createNativeStackNavigator<RootStackParamList>();

// Function to asynchronously load fonts
const fetchFonts = () => {
  return Font.loadAsync({
    'JosefinSans-Regular': require('./fonts/JosefinSans-Regular.ttf'),
    'JosefinSans-Italic': require('./fonts/JosefinSans-Italic.ttf'),
    'JosefinSans-Bold': require('./fonts/JosefinSans-Bold.ttf'),
  });
};

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Initialize Backendless with your application ID and API key
        Backendless.initApp('98E9F92E-70F6-5F4D-FF47-A45B6253CB00', 'D9AC34A2-9620-4BFB-9219-C4C640887E28');
        // Load custom fonts
        await fetchFonts();
        setFontLoaded(true);
      } catch (error) {
        console.error('Initialization error:', error);
        setError('Failed to initialize app');
      } finally {
        setInitializing(false);
      }
    }

    initializeApp();
  }, []);

  if (initializing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        {error && <Text>{error}</Text>}
      </View>
    );
  }

  if (!fontLoaded) {
    function initializeApp() {
      throw new Error('Function not implemented.');
    }

    return (
      <View style={styles.loaderContainer}>
        <Text>Failed to load fonts.</Text>
        <Button title="Retry" onPress={() => {
      // Retrying font loading by resetting the fontLoaded state
      setFontLoaded(false);
      initializeApp(); // Call initialization again
    }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={Auth} options={{ headerShown: false }} />
        <Stack.Screen name="Account" component={Account} options={{ headerShown: false }} />
        <Stack.Screen name="MainTab" component={MainTab} options={{ headerShown: false }} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  }
});
