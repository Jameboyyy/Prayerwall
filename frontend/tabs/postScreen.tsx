import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Backendless from 'backendless';

const PostScreen = () => {
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');

  const handlePostSubmit = async () => {
    // Validate the post content (optional)
    if (!postContent.trim()) {
      Alert.alert('Error', 'Post content cannot be empty.');
      return;
    }
  
    // Prepare the post data
    const postData = {
      title: postTitle,
      content: postContent,
    };
  
    // Retrieve the current user's token from AsyncStorage
    const userToken = await AsyncStorage.getItem('user_token');
  
    if (!userToken) {
      Alert.alert('Error', 'User token not found.');
      return;
    }
  
    // Send the post data to the Posts table
    const response = await fetch('https://api.backendless.com/98E9F92E-70F6-5F4D-FF47-A45B6253CB00/09FEE149-C7DF-47A3-944B-47A6769CDB21/data/Posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-token': userToken, // Include the user token in the request headers
      },
      body: JSON.stringify(postData),
    });
  
    if (response.ok) {
      Alert.alert('Success', 'Post submitted successfully.');
      // Optionally, you can navigate to another screen or perform any other actions
    } else {
      // Log the response status and body if the request fails
      console.log('Response status:', response.status);
      response.text().then(text => {
        console.log('Response body:', text);
      });
      Alert.alert('Error', 'Failed to submit post. Please try again later.');
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
