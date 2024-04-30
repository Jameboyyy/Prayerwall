import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, getDownloadURL } from 'firebase/storage'; // Import required functions for storage
import { firestore } from '../firebaseConfig';

const Account = ({ navigation }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const auth = getAuth();
    const storage = getStorage(); // Get Firebase Storage instance

    async function fetchDefaultProfilePic() {
        const storageRef = ref(storage, 'gs://prayerwall-2f4c4.appspot.com/Default_Picture.png');
        return await getDownloadURL(storageRef);
    }

    async function registerUsername(username, userId) {
        const usernameRef = doc(firestore, 'usernames', username);
        const docSnap = await getDoc(usernameRef);
        if (docSnap.exists()) {
            throw new Error('Username already taken.');
        } else {
            await setDoc(usernameRef, { userId: userId });
            return true;
        }
    }

    const handleSubmit = async () => {
        if (!auth.currentUser) {
            Alert.alert("Error", "No user logged in");
            return;
        }
    
        try {
            const uid = auth.currentUser.uid;
            const profilePictureUrl = await fetchDefaultProfilePic(); // Fetch the URL of the default profile picture
            await registerUsername(username, uid);

            await setDoc(doc(firestore, "users", uid), {
                firstName: firstName,
                lastName: lastName,
                username: username,
                profilePicture: profilePictureUrl // Use the fetched URL here
            }, { merge: true });
    
            Alert.alert("Success", "Profile details submitted successfully");
            navigation.navigate('Main');
        } catch (error) {
            console.error("Error writing document: ", error);
            Alert.alert("Error", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <TextInput style={styles.input} placeholder="First Name" autoCapitalize='none' value={firstName} onChangeText={setFirstName} />
            <TextInput style={styles.input} placeholder="Last Name" autoCapitalize='none' value={lastName} onChangeText={setLastName} />
            <TextInput style={styles.input} placeholder="Username" autoCapitalize='none' value={username} onChangeText={setUsername} />
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d2e7d6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        color: '#3a506b',
        fontFamily: 'JosefinSans-Regular',
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
        fontFamily: 'JosefinSans-Regular',
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
        fontFamily: 'JosefinSans-Regular',
    }
});

export default Account;
