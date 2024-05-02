import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore } from '../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';

interface UserProfile {
    username: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
}

const EditProfile = () => {
    const [user, setUser] = useState<UserProfile>({
        username: '',
        firstName: '',
        lastName: '',
        profilePicture: ''
    });

    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        if (userId) {
            const fetchUserData = async () => {
                const docRef = doc(firestore, "users", userId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUser(docSnap.data() as UserProfile);
                } else {
                    console.log("No such document!");
                }
            };
            fetchUserData();
        }
    }, [userId]);

    const handleImagePick = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }
    
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
    
        console.log('Image Picker Result:', result);
    
        if (!result.cancelled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setUser(prevState => ({ ...prevState, profilePicture: uri }));
            console.log('Profile picture updated:', uri);
        } else {
            console.log('Image picker was cancelled or no URI found');
        }
    };
    
    
    const saveChanges = async () => {
        if (!userId) return;
        try {
            const userRef = doc(firestore, "users", userId);
            await updateDoc(userRef, {
                firstName: user.firstName,
                lastName: user.lastName,
                profilePicture: user.profilePicture,
            });
            Alert.alert('Update Successful', 'Your profile has been updated.');
        } catch (error) {
            console.error('Error updating user:', error);
            Alert.alert('Error', 'Failed to update profile.');
        }
    };

    return (
        <View style={styles.container}>
            {user.profilePicture ? (
                <Image
                    source={{ uri: user.profilePicture }}
                    style={styles.profilePic}
                />
            ) : (
                <Text>No Profile Picture</Text>
            )}
            <TextInput
                style={styles.input}
                value={user.firstName}
                onChangeText={text => setUser(prev => ({ ...prev, firstName: text }))}
                placeholder="First Name"
            />
            <TextInput
                style={styles.input}
                value={user.lastName}
                onChangeText={text => setUser(prev => ({ ...prev, lastName: text }))}
                placeholder="Last Name"
            />
            <TouchableOpacity style={styles.button} onPress={handleImagePick}>
                <Text style={styles.buttonText}>Change Profile Picture</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={saveChanges}>
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
        backgroundColor: '#d2e7d6',
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    },
    input: {
        width: '85%',
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#3a506b',
        padding: 10,
        borderRadius: 5,
        width: '85%',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    }
});

export default EditProfile;
