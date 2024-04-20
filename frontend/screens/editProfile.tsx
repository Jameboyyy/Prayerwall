import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import Backendless from 'backendless';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // Importing ImagePicker from Expo
import { CustomUser } from '@/userTypes';

const EditProfile = () => {
    const navigation = useNavigation();
    const [user, setUser] = useState<CustomUser | null>(null);
    const [profileImageUri, setProfileImageUri] = useState<string>('https://res.cloudinary.com/dwey7oaba/image/upload/v1713607870/Default_Picture_ylyjcn.png');

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const fetchUserDetails = async () => {
        try {
            const currentUser = await Backendless.UserService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser as CustomUser); // Explicitly cast currentUser to CustomUser
                // Use nullish coalescing operator (??) for setting profileImageUri
                setProfileImageUri((currentUser as CustomUser).profilePicture ?? 'https://res.cloudinary.com/dwey7oaba/image/upload/v1713607870/Default_Picture_ylyjcn.png');
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
            Alert.alert("Error", "Unable to fetch user data.");
        }
    };

    const handleChoosePhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }
    
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
    
        console.log(result);
    
        if (result && !result.canceled && 'uri' in result) {
            setProfileImageUri(result.uri as string);
        }
    };

    const handleSave = async () => {
        if (!user) {
            Alert.alert('Error', 'No user data available.');
            return;
        }

        const updatedUser: CustomUser = {
            ...user,
            // Use optional chaining and nullish coalescing for accessing firstName and lastName
            firstName: user?.firstName?.trim(),
            lastName: user?.lastName?.trim(),
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
                value={user?.firstName ?? ''}
                onChangeText={(value) => setUser(prev => prev ? { ...prev, firstName: value } : null)}
                placeholder="First Name"
            />
            <TextInput
                style={styles.input}
                value={user?.lastName ?? ''}
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
