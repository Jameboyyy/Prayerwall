import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import Backendless from 'backendless';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomUser } from '@/userTypes'; // Ensure this path is correctly set

const EditProfile = () => {
    const navigation = useNavigation();
    const [user, setUser] = useState<CustomUser | null>(null);
    const [profileImageUri, setProfileImageUri] = useState<string>('https://res.cloudinary.com/dwey7oaba/image/upload/v1713607870/Default_Picture_ylyjcn.png');
    
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const currentUser = await Backendless.UserService.getCurrentUser();
                console.log('Current User:', currentUser); // Log the current user object
                if (currentUser) {
                    setUser(currentUser as CustomUser);
                    setProfileImageUri((currentUser as CustomUser).profilePicture || 'https://res.cloudinary.com/dwey7oaba/image/upload/v1713607870/Default_Picture_ylyjcn.png');
                    const userToken = await AsyncStorage.getItem('user_token'); // Retrieve the user token from storage
                    console.log('User Token:', userToken); // Log the retrieved user token
                    if (!userToken) {
                        // If the token is not stored, you can log the user out or handle it accordingly
                        console.error("No user token available");
                        // You might want to navigate the user to the login screen
                        return;
                    }
                    // Set the user token in AsyncStorage (optional)
                    AsyncStorage.setItem('user_token', userToken);
                }
            } catch (error) {
                console.error('Fetch User Details Error:', error); // Log any errors that occur during user details fetching
            }
        };
        fetchUserDetails();
    }, []);

    const handleChoosePhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera roll permission is required to access your photos.');
            return;
        }
    
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
    
        console.log('Image Picker Result:', result); // Log the result
    
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageUrl = await uploadImageToBackendless(result.assets[0].uri);
            if (imageUrl) {
                setProfileImageUri(imageUrl);
            } else {
                Alert.alert('Upload Failed', 'Failed to upload image.');
            }
        }
    };
    

    // Example code to handle file upload with proper headers
    const uploadImageToBackendless = async (imageUri: string): Promise<string | null> => {
        const filename = imageUri.split('/').pop() ?? 'upload.jpg';
        const response = await fetch(imageUri);
        const blob = await response.blob();
    
        let formData = new FormData();
        formData.append('file', blob, filename);
    
        try {
            const userToken = await AsyncStorage.getItem('user_token');
            if (!userToken) {
                console.error("No user token available, can't upload");
                return null;
            }
            
    
            const uploadResponse = await fetch(`https://turgentloaf.backendless.app/98E9F92E-70F6-5F4D-FF47-A45B6253CB00/09FEE149-C7DF-47A3-944B-47A6769CDB21/files/ProfilePictures/${filename}?overwrite=true`, {
                method: 'POST',
                headers: {
                    // Updated Content-Type header to 'multipart/form-data'
                    'Content-Type': 'multipart/form-data',
                    'user-token': userToken
                },
                body: formData
            });
    
            if (!uploadResponse.ok) {
                console.error(`Upload error: ${uploadResponse.status}`);
                return null;
            }
    
            const responseData = await uploadResponse.json();
            return responseData.fileURL;
        } catch (error) {
            console.error('Upload error:', error);
            return null;
        }
    };
    

    const handleSave = async () => {
        if (!user) {
            Alert.alert('Error', 'No user data available.');
            return;
        }

        const updatedUser = {
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
