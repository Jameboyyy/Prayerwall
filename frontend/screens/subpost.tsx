import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, addDoc, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Subpost = ({ postId }: { postId: string }) => {
    const [content, setContent] = useState('');

    const firestore = getFirestore(); // Get Firestore instance
    const auth = getAuth(); // Get Auth instance

    const handleSubpostSubmit = async () => {
        if (!auth.currentUser) {
            Alert.alert('Error', 'No user logged in');
            return;
        }

        if (!content) {
            Alert.alert('Error', 'Please fill in content');
            return;
        }

        try {
            await addDoc(collection(firestore, "subposts", postId), {
                content: content,
                createdAt: new Date(),
                userId: auth.currentUser.uid
            });
            Alert.alert('Success', 'Subpost has been submitted!');
            setContent('');
        } catch (error) {
            console.error('Error adding subpost:', error);
            Alert.alert('Error', 'There was a problem submitting your subpost');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.inputContent}
                value={content}
                onChangeText={setContent}
                placeholder="Enter subpost content"
                multiline={true}
                numberOfLines={4}
            />
            <TouchableOpacity style={styles.button} onPress={handleSubpostSubmit}>
                <Text style={styles.buttonText}>Submit Subpost</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#d2e7d6',
        width: '100%',
    },
    inputContent: {
        width: '100%',
        height: 150,
        marginVertical: 8,
        padding: 10,
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
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'JosefinSans-Regular',
    }
});

export default Subpost;
