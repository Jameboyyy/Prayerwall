import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootParamList } from '../types/types';

type AccountRouteProp = RouteProp<RootParamList, 'Account'>;
const Account = () => {
    const route = useRoute<AccountRouteProp>();
    const user = route.params.user;
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');

    const handleSave = () => {
        console.log('First Name:', firstName, 'Last Name:', lastName, 'Username:', username);
        console.log('User ID:', user.uid); 
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text>Welcome, {user.email}</Text> {/* Displaying the user's email */}
            <TextInput
                style={styles.input}
                onChangeText={setFirstName}
                value={firstName}
                placeholder="Enter your first name"
            />
            <TextInput
                style={styles.input}
                onChangeText={setLastName}
                value={lastName}
                placeholder="Enter your last name"
            />
            <TextInput
                style={styles.input}
                onChangeText={setUsername}
                value={username}
                placeholder="Choose a username"
            />
            <Button
                title="Save Profile"
                onPress={handleSave}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 40,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
    }
});

export default Account;
