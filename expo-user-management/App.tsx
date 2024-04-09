import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Auth from './components/Auth'
import Account from './components/Account'
import { View } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { useFonts } from 'expo-font'

const Stack = createNativeStackNavigator();

export default function App() {

  let [fontsLoaded] =  useFonts({
    'JosefinSans-Regular': require('./fonts/JosefinSans-Regular.ttf'),
    'JosefinSans-SemiBoldItalic': require('./fonts/JosefinSans-SemiBoldItalic.ttf'),
  })


  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.unsubscribe();
    };
  }, []);

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {session ? (
          // If there is a session, navigate to the Account screen
          <Stack.Screen name="Account" component={Account} options={{ title: 'Account Details' }} />
        ) : (
          // No session found, show the Auth screen
          <Stack.Screen name="Auth" component={Auth} options={{ title: 'Sign Up / Log In' }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}