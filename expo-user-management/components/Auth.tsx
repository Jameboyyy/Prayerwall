import React, { useState } from 'react';
import { Alert, StyleSheet, View, AppState, } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input, Text, Image } from 'react-native-elements';

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false); 

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    else Alert.alert('Sign up successful, please check your email for verification.');
    setLoading(false);
  }

  // Toggles the form between Sign Up and Log In
  function toggleForm() {
    setIsSigningUp(!isSigningUp);
  }

  return (
    <View style={styles.container}>
        <View style={styles.title_container}>
            <Text style={styles.title}>Prayerwall</Text>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
        </View>
        <View style = {styles.form_container}>
            <Input style ={styles.email_input}
            label="Email"
            leftIcon={{ type: 'font-awesome', name: 'envelope' }}
            onChangeText={setEmail}
            value={email}
            placeholder="email@address.com"
            autoCapitalize="none"
            />
            <Input
                label="Password"
                leftIcon={{ type: 'font-awesome', name: 'lock' }}
                onChangeText={setPassword}
                value={password}
                secureTextEntry={true}
                placeholder="Password"
                autoCapitalize="none"
            />
            {isSigningUp ? (
                <>
                <Button title="Sign Up" disabled={loading} onPress={signUpWithEmail} />
                <Button title="Already have an account? Log In" type="clear" onPress={toggleForm} />
                </>
            ) : (
                <>
                <Button title="Log In" disabled={loading} onPress={signInWithEmail} />
                <Button title="Need an account? Sign Up" type="clear" onPress={toggleForm} />
                </>
            )}
        </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#d2e7d6',
  },
  title_container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '25%'
  },
  title: {
    fontSize: 32,
    color: '#3a506b',
    fontFamily: 'JosefinSans-SemiBoldItalic',
    fontWeight: '600',
    lineHeight: 42,
    textAlign: 'center',
  },
  logo: {
    width: 40,
    height: 100,
  },
  form_container: {
    padding: 12,
  },
  email_input: {

  },
  verticallySpaced: {

  },
  mt20: {
    
  },
});
