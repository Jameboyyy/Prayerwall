import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

// Assuming your interfaces are defined elsewhere and imported here
interface Subpost {
    content: string;
    createdAt: string;
}

interface Post {
    title: string;
    content: string;
    subpost?: Subpost;
}

const EditPost = ({ route, navigation }) => {
    const { postId } = route.params;
    const [post, setPost] = useState<Post | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [subpostContent, setSubpostContent] = useState('');

    useEffect(() => {
        const firestore = getFirestore();
        const postRef = doc(firestore, 'posts', postId);
        getDoc(postRef).then(docSnap => {
            if (docSnap.exists()) {
                const postData = docSnap.data() as Post;
                setPost(postData);
                setTitle(postData.title);
                setContent(postData.content);
                if (postData.subpost) {
                    setSubpostContent(postData.subpost.content);
                }
            } else {
                Alert.alert('Error', 'No such document!');
                navigation.goBack();
            }
        });
    }, [postId, navigation]);

    const handleSave = async () => {
        const firestore = getFirestore();
        const postRef = doc(firestore, 'posts', postId);
        const updateData: any = {
            title: title,
            content: content,
        };

        if (post?.subpost && subpostContent.trim() !== '') {
            updateData.subpost = { content: subpostContent, createdAt: new Date().toISOString() };
        }

        try {
            await updateDoc(postRef, updateData);
            Alert.alert('Success', 'Post updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Error updating document:', error);
            Alert.alert('Error', 'There was a problem updating your post');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Edit Post</Text>
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
            {post?.subpost && (
                <>
                    <Text style={styles.label}>Subpost Content</Text>
                    <TextInput
                        style={styles.inputContent}
                        value={subpostContent}
                        onChangeText={setSubpostContent}
                        placeholder="Edit subpost content"
                        multiline={true}
                        numberOfLines={4}
                    />
                </>
            )}
            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save Changes</Text>
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
        marginBottom: 20,
    },
    label: {
        alignSelf: 'flex-start',
        marginLeft: 20,
        color: '#3a506b',
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        width: '90%',
        padding: 10,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    inputContent: {
        width: '90%',
        height: 150,
        padding: 10,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#fff',
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        width: '90%',
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    }
});

export default EditPost;
