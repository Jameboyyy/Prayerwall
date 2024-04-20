import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import Backendless from 'backendless';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, MediaType, ImageLibraryOptions } from 'react-native-image-picker'; // Importing MediaType and ImageLibraryOptions

import { CustomUser } from '../userTypes';

// Define custom ImagePickerResponse interface
interface ImagePickerResponse {
    didCancel: boolean;
    errorMessage?: string;
    assets?: {
        uri: string;
    }[];
}

const EditProfile = () => {
    const navigation = useNavigation();
    const [user, setUser] = useState<CustomUser | null>(null);
    const [profileImageUri, setProfileImageUri] = useState<string>('https://drive.google.com/file/d/1fF3TYk_qpARV8HskPup4GVRYQYNcZ-nQ/view?usp=sharing');

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const fetchUserDetails = async () => {
        try {
            const currentUser = await Backendless.UserService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser as CustomUser);
                setProfileImageUri(currentUser.profilePicture || 'https://drive.google.com/file/d/1fF3TYk_qpARV8HskPup4GVRYQYNcZ-nQ/view?usp=sharing');
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
            Alert.alert("Error", "Unable to fetch user data.");
        }
    };

    const handleChoosePhoto = () => {
        const options: ImageLibraryOptions = {
            mediaType: 'photo', // Specify mediaType as 'photo' of type MediaType
            quality: 1,
            selectionLimit: 1,
            includeBase64: false,
        };
        launchImageLibrary(options, (response: ImagePickerResponse) => { // Use custom ImagePickerResponse interface
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorMessage) {
                console.error('ImagePicker Error: ', response.errorMessage);
                Alert.alert('Error', response.errorMessage);
            } else if (response.assets && response.assets[0].uri) {
                setProfileImageUri(response.assets[0].uri);
            }
        });
    };
    

    const handleSave = async () => {
        if (!user) {
            Alert.alert('Error', 'No user data available.');
            return;
        }

        const updatedUser: CustomUser = {
            ...user,
            firstName: user.firstName?.trim(),
            lastName: user.lastName?.trim(),
            profilePicture: profileImageUri
        };

        try {
            await Backendless.UserService.update(updatedUser);
            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Failed to update profile:', error);
            Alert.alert('Error', 'Failed to update profile.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Edit Profile</Text>
            <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
            <TouchableOpacity style={styles.button} onPress={handleChoosePhoto}>
                <Text style={styles.buttonText}>Change Profile Picture</Text>
            </TouchableOpacity>
            <TextInput
                style={styles.input}
                value={user?.firstName || ''}
                onChangeText={(value) => setUser(prev => prev ? { ...prev, firstName: value } : null)}
                placeholder="First Name"
            />
            <TextInput
                style={styles.input}
                value={user?.lastName || ''}
                onChangeText={(value) => setUser(prev => prev ? { ...prev, lastName: value } : null)}
                placeholder="Last Name"
            />
            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#d2e7d6'
    },
    input: {
        backgroundColor: '#ffffff',
        width: '90%',
        marginVertical: 10,
        borderWidth: 1,
        padding: 10,
        borderColor: '#ddd',
        borderRadius: 2,
    },
    label: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#3a506b',
    },
    button: {
        backgroundColor: '#3a506b',
        width: '90%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        marginTop: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    },
});

export default EditProfile;
