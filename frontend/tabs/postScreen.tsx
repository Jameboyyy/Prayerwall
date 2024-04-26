import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Backendless from 'backendless';

const PostScreen = () => {
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');

  const handlePostSubmit = async () => {
    if (!postContent.trim()) {
      Alert.alert('Error', 'Post content cannot be empty.');
      return;
    }
  
    const userToken = await AsyncStorage.getItem('user_token');
    const userId = await AsyncStorage.getItem('user_id');  // Retrieve the user's objectId stored during login

    if (!userToken || !userId) {
      Alert.alert('Error', 'User token or user ID not found.');
      return;
    }

    const postData = {
      title: postTitle,
      content: postContent,
      ownerId: userId  // Use the stored user objectId
    };
  
    try {
      const response = await fetch('https://api.backendless.com/98E9F92E-70F6-5F4D-FF47-A45B6253CB00/09FEE149-C7DF-47A3-944B-47A6769CDB21/data/Posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-token': userToken,
        },
        body: JSON.stringify(postData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to submit post:', errorText);
        Alert.alert('Error', 'Failed to submit post. Please try again later.');
        return;
      }
  
      Alert.alert('Success', 'Post submitted successfully.');
      setPostTitle('');
      setPostContent('');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };
  
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter post title"
        value={postTitle}
        onChangeText={text => setPostTitle(text)}
      />
      <TextInput
        style={[styles.input, { height: 200 }]}
        placeholder="Enter post content"
        value={postContent}
        onChangeText={text => setPostContent(text)}
        multiline={true}
      />
      <TouchableOpacity style={[styles.button, styles.postButton]} onPress={handlePostSubmit}>
        <Text style={styles.buttonText}>Submit Post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#d2e7d6', // Set container background color
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  postButton: {
    backgroundColor: '#3a506b', // Set button background color
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PostScreen;
