import React, { useState } from 'react';
import { View, StyleSheet, Button, TextInput } from 'react-native';

function Account({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = async () => {
    // Placeholder for submitting the user details
    // Here you would typically update the user's profile in your backend
    console.log(firstName, lastName, dateOfBirth, username);

    // Optionally navigate the user to another screen upon successful update
    // navigation.navigate('AnotherScreen');
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <TextInput placeholder="Last Name" value={lastName} onChangeText={setLastName} />
      <TextInput placeholder="Date of Birth" value={dateOfBirth} onChangeText={setDateOfBirth} />
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  // Add styles for your inputs and button as needed
});

export default Account;
