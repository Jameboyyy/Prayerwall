import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import Backendless from 'backendless';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomUser } from '@/userTypes';  // Adjust the import path as necessary

// Define the navigation stack parameters list
type RootStackParamList = {
    Account: { ownerId: string };
    UserFeed: undefined;
    Auth: undefined;
    MainTab: { screen: keyof MainTabParamList } | undefined;
};

type MainTabParamList = {
    UserFeed: undefined;
    UserProfile: undefined;
    Search: undefined;
};

type AccountProps = NativeStackScreenProps<RootStackParamList, 'Account'>;

const Account: React.FC<AccountProps> = ({ route, navigation }) => {
    const { ownerId } = route.params;
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');

    const handleSave = async () => {
        const user = await Backendless.UserService.getCurrentUser() as CustomUser | null;
        if (!user) {
            Alert.alert('Error', 'User not found.');
            return;
        }
        // Update user properties
        user.firstName = firstName;
        user.lastName = lastName;
        user.username = username;

        try {
            const updatedUser = await Backendless.UserService.update(user) as CustomUser;
            console.log('Profile updated:', updatedUser);

            // Navigate based on profile completeness
            if (updatedUser.firstName && updatedUser.lastName && updatedUser.username) {
                navigation.navigate('MainTab', { screen: 'UserFeed' });
            } else {
                Alert.alert('Profile Incomplete', 'Please complete all fields in your profile.');
            }
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
            <View style={styles.title_container}>
                <Text style={styles.title}>Prayerwall</Text>
                <Image source={require('../assets/pw_logo.png')} style={styles.logo}/>
            </View>
            <Text style={styles.sub_title}>Complete Your Profile!</Text>
            <View style={styles.form_container}>
                <Text style={styles.label}>First Name</Text>
                <TextInput 
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    style={styles.input}
                    autoCapitalize="none"
                />
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    style={styles.input}
                    autoCapitalize="none"
                />
                <Text style={styles.label}>Username</Text>
                <TextInput
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                    autoCapitalize="none"
                />
                <TouchableOpacity style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        backgroundColor: '#d2e7d6',  // Assuming this is your Auth screen background color
        alignItems: 'center',
    },
    title_container: {
        marginTop: '25%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontFamily: 'JosefinSans-Bold',
        color: '#3a506b',
        textAlign: 'center',
    },
    sub_title: {
        fontSize: 16,
        fontFamily: 'JosefinSans-Italic',
        color: '#3a506b',
        textAlign: 'center',
        marginTop: 10,
    },
    logo: {
        width: 40,
        height: 100,
    },
    form_container: {
        justifyContent: 'center',

    },
    label: {
        textAlign: 'left',
        marginTop: 25,
        fontFamily: 'JosefinSans-Regular',
    },
    input: {
        backgroundColor: '#ffffff',
        width: 327,
        height: 50,
        borderRadius: 2,
        padding: 10,
        marginBottom: 10,
        marginTop: 5,
        borderWidth: 1,
        borderColor: 'gray',
        color: '#a9a9a9',
        fontFamily: 'JosefinSans-Regular',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#3a506b',
        width: 327,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        marginTop: 25,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'JosefinSans-Italic'
    }
});

export default Account;
