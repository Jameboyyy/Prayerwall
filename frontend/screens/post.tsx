import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, addDoc, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Post = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const firestore = getFirestore(); // Get Firestore instance
    const auth = getAuth(); // Get Auth instance

    const handlePostSubmit = async () => {
        console.log("Current User UID:", auth.currentUser?.uid);

        if (!auth.currentUser) {
            Alert.alert('Error', 'No user logged in');
            return;
        }

        if (!title || !content) {
            Alert.alert('Error', 'Please fill in both title and content');
            return;
        }

        try {
            await addDoc(collection(firestore, "posts"), {
                title: title,
                content: content,
                createdAt: new Date(),
                userId: auth.currentUser.uid
            });
            Alert.alert('Success', 'Post has been submitted!');
            setTitle('');
            setContent('');
        } catch (error) {
            console.error('Error adding document:', error);
            Alert.alert('Error', 'There was a problem submitting your post');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Share Your Prayer Requests</Text>
            <Text style={styles.label}>Title</Text>
            <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter post title"
            />
            <Text style={styles.label}>Content</Text>
            <TextInput
                style={styles.inputContent}
                value={content}
                onChangeText={setContent}
                placeholder="Enter post content"
                multiline={true}
                numberOfLines={4}
            />
            <TouchableOpacity style={styles.button} onPress={handlePostSubmit}>
                <Text style={styles.buttonText}>Submit Post</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
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
    label: {
        alignSelf: 'flex-start',
        marginLeft: '5%',
        color: '#3a506b',
        fontFamily: 'JosefinSans-Regular',
    },
    input: {
        width: '90%',
        padding: 10,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 5,
        backgroundColor: '#fff',
        fontFamily: 'JosefinSans-Regular',
    },
    inputContent: {
        width: '90%',
        height: 150, // Adjusted for better text entry
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
        width: '90%',
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'JosefinSans-Regular',
    }
});

export default Post;
