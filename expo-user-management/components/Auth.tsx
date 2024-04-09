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

    const { error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if(signUpError) {
      Alert.alert(signUpError.message);
    } else {
      Alert.alert('Sign up successful. Please check your email for verification.');
    }
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
      <View style={styles.form_container}>
        {isSigningUp ? (
          <>
            <Input style={styles.input}
              placeholder="email@address.com"
              onChangeText={setEmail}
              value={email}
              autoComplete='off'
              inputStyle={{ paddingLeft: 10}}
              label="Email"
              autoCapitalize="none"
              labelStyle={styles.label}
            />
            <Input style={styles.input}
              placeholder="Password"
              onChangeText={setPassword}
              value={password}
              autoComplete='off'
              secureTextEntry={true}
              inputStyle={{ paddingLeft: 10}}
              label="Password"
              autoCapitalize="none"
              labelStyle={styles.label}
            />
            <Button buttonStyle={styles.auth_btn} titleStyle={styles.auth_btn_text} title="Sign Up" disabled={loading} onPress={signUpWithEmail} />
            <Button title="Already have an account? Log In" type="clear" onPress={toggleForm} />
          </>
        ) : (
          <>
            <Input style={styles.input}
              placeholder="email@address.com"
              onChangeText={setEmail}
              value={email}
              autoComplete='off'
              inputStyle={{ paddingLeft: 10}}
              label="Email"
              autoCapitalize="none"
              labelStyle={styles.label}
            />
            <Input style={styles.input}
              placeholder="Password"
              onChangeText={setPassword}
              value={password}
              autoComplete='off'
              secureTextEntry={true}
              inputStyle={{ paddingLeft: 10}}
              label="Password"
              autoCapitalize="none"
              labelStyle={styles.label}
            />
            <Button buttonStyle={styles.auth_btn} titleStyle={styles.auth_btn_text} title="Log In" disabled={loading} onPress={signInWithEmail} />
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
    alignItems: 'center',
  },
  label: {
    fontFamily: 'JosefinSans-SemiBoldItalic',
    marginBottom: 8,
    color: '#030303'
  },
  input: {
    fontFamily: 'JosefinSans-SemiBoldItalic',
    backgroundColor: '#ffffff',
    width: 327,
    height: 50,
    borderRadius: 2,
    lineHeight: 19,
    color: '#a9a9a9',
    paddingRight: 20
  },
  auth_btn:{
    backgroundColor: '#3a506b',
    color: '#ffffff', 
    height: 50,
    width: 327,
  },
  auth_btn_text: {
    fontFamily: 'JosefinSans-SemiBoldItalic',
  },
  verticallySpaced: {

  },
  mt20: {
    
  },
});
