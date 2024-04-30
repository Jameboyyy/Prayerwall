import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc, DocumentData } from 'firebase/firestore';

const EditPost = ({ route, navigation }) => {
    const { postId } = route.params;
    const [post, setPost] = useState<DocumentData | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            const firestore = getFirestore();
            const postRef = doc(firestore, 'posts', postId);
            const docSnap = await getDoc(postRef);

            if (docSnap.exists()) {
                const postData = docSnap.data();
                setPost(postData);
                setTitle(postData.title);
                setContent(postData.content);
            } else {
                console.log('No such document!');
                navigation.goBack();
            }
        };

        fetchPost();
    }, [postId, navigation]);

    const handleSave = async () => {
        try {
            const firestore = getFirestore();
            const postRef = doc(firestore, 'posts', postId);
            await updateDoc(postRef, {
                title: title,
                content: content,
            });
            Alert.alert('Success', 'Post updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Error updating document:', error);
            Alert.alert('Error', 'There was a problem updating your post');
        }
    };

    if (!post) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Edit Post</Text>
            <TextInput 
                style={styles.input} 
                value={title} 
                onChangeText={setTitle} 
                placeholder="Enter post title" 
            />
            <TextInput 
                style={styles.inputContent} 
                value={content} 
                onChangeText={setContent} 
                placeholder="Enter post content" 
                multiline={true} 
                numberOfLines={4} 
            />
            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Finish Editing</Text>
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
        fontFamily: 'JosefinSans-Regular', 
        fontSize: 16
    }
});

export default EditPost;
