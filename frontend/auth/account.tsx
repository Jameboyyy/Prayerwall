import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import Backendless from 'backendless';
import { StackScreenProps } from '@react-navigation/stack';

// Define the navigation stack parameters list
type RootStackParamList = {
    Account: { userId: string };  // Define parameters for the 'Account' screen
    UserFeed: undefined;          // Define 'UserFeed' screen without parameters
};

// Define types for the Account screen props
type AccountProps = StackScreenProps<RootStackParamList, 'Account'>;

// Account component
const Account: React.FC<AccountProps> = ({ route, navigation }) => {
    const { userId } = route.params;  // Extract userId from navigation parameters
    const [firstName, setFirstName] = useState(''); // State for first name
    const [lastName, setLastName] = useState('');   // State for last name
    const [username, setUsername] = useState('');   // State for username

    // Function to handle profile save action
    const handleSave = async () => {
        try {
          const user = (await Backendless.UserService.getCurrentUser()) as CustomUser;
          user.firstName = firstName;
          user.lastName = lastName;
          user.username = username;
      
          const updatedUser = await Backendless.UserService.update(user) as CustomUser;
          Alert.alert('Success', 'Profile updated successfully!');
          navigation.navigate('UserFeed');
        } catch (error) {
          if (error instanceof Error) {
            Alert.alert('Error', error.message);
          } else {
            Alert.alert('Error', 'An unexpected error occurred');
          }
        }
      };
      

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
            />
            <TextInput
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
            />
            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
            />
            <Button title="Save Profile" onPress={handleSave} />
        </View>
    );
};

// Styles for the Account component
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff'
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: 8,
        marginVertical: 10,
    }
});

export default Account;
