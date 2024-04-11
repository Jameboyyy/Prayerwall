import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Input, Text, Image } from 'react-native-elements';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [user_name, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  

  const completeProfile = async () => {
    setLoading(true);
    try {
      // Fetching the current user's details
      const { data: { user }, error: userError } = await supabase.auth.getUser();
  
      if (userError) throw userError;
      if (!user) throw new Error('No user on the session!');
  
      // Inserting new profile details
      const { data, error } = await supabase
        .from('User_Profiles')
        .insert([{
          id: user.id, // Assuming 'id' is the column in 'User_Profiles' linked to the user's ID from auth
          user_name: user_name,
          firstName: firstName,
          lastName: lastName,
          dateOfBirth: dateOfBirth,
        }])
        .single(); // Use .single() if inserting a single row and you expect a single object response
  
      if (error) throw error;
  
      Alert.alert("Profile completion successful!");
    } catch (error) {
      console.error(error);
      if(error instanceof Error){
        Alert.alert('Error', error.message);
      } else {
        // Handling cases where the error might not be an instance of Error
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.title_container}>
        <Text style={styles.title}>Prayerwall</Text>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>
      {/* User's Username */}
      <View style={styles.verticallySpaced}>
        <Input
          label="Username"
          value={user_name}
          onChangeText={(text) => setUsername(text)}
        />
      </View>
      {/* User's First Name */}
      <View style={styles.verticallySpaced}>
        <Input
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
      </View>
      {/* User's Last Name */}
      <View style={styles.verticallySpaced}>
        <Input
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
      </View>
      {/* User's Date of Birth */}
      <View style={styles.verticallySpaced}>
        <Input
          label="Date of Birth"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
        />
      </View>
      {/* Update Profile Button */}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? 'Loading ...' : 'Complete Profile'}
          onPress={completeProfile}
          disabled={loading}
        />
      </View>
      {/* Sign Out Button */}
      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
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
  title:{
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
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});
