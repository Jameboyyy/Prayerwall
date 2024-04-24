import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Backendless from 'backendless';
import { CustomPost } from '../types';  // Ensure this path is correct

const PostScreen = () => {
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState<CustomPost[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostSubmit = async () => {
    if (!postContent.trim()) {
      Alert.alert('Error', 'Post content cannot be empty.');
      return;
    }

    const postData = {
      title: postTitle,
      content: postContent,
    };

    const userToken = await AsyncStorage.getItem('user_token');
    if (!userToken) {
      Alert.alert('Error', 'User token not found.');
      return;
    }

    const response = await fetch('https://api.backendless.com/98E9F92E-70F6-5F4D-FF47-A45B6253CB00/09FEE149-C7DF-47A3-944B-47A6769CDB21/data/Posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-token': userToken,
      },
      body: JSON.stringify(postData),
    });

    if (response.ok) {
      Alert.alert('Success', 'Post submitted successfully.');
      setPostTitle('');
      setPostContent('');
      fetchPosts();  // Refetch posts to update the list
    } else {
      const errorText = await response.text();
      console.error('Failed to submit post:', errorText);
      Alert.alert('Error', 'Failed to submit post. Please try again later.');
    }
  };

  const fetchPosts = async () => {
    const userToken = await AsyncStorage.getItem('user_token');
    if (userToken) {
      const response = await fetch('https://api.backendless.com/98E9F92E-70F6-5F4D-FF47-A45B6253CB00/09FEE149-C7DF-47A3-944B-47A6769CDB21/data/Posts', {
        headers: {
          'Content-Type': 'application/json',
          'user-token': userToken
        }
      });

      if (response.ok) {
        const fetchedPosts: CustomPost[] = await response.json();
        console.log('Fetched posts:', fetchedPosts.map(post => ({ title: post.title, created: post.created }))); // Log fetched posts and their created field
        fetchedPosts.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()); // Sort by date
        setPosts(fetchedPosts);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch posts:', errorText);
        Alert.alert('Error', 'Failed to fetch posts. Please try again later.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.title_container}>
          <Text style={styles.title}>Share Your Prayer Request</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter post title"
            value={postTitle}
            onChangeText={setPostTitle}
          />
          <TextInput
            style={[styles.input, { height: 200 }]}
            placeholder="Enter post content"
            value={postContent}
            onChangeText={setPostContent}
            multiline={true}
          />
          <TouchableOpacity style={[styles.button, styles.postButton]} onPress={handlePostSubmit}>
            <Text style={styles.buttonText}>Submit Post</Text>
          </TouchableOpacity>
        </View>
        {/* Display posts */}
        {posts.map(post => (
          <View key={post.objectId} style={styles.postContainer}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent}>{post.content}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#d2e7d6',
  },
  title_container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#3a506b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    width: '100%',
  },
  button: {
    backgroundColor: '#3a506b',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    height: 50,
    width: '100%',
  },
  postButton: {
    marginTop: 20
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3a506b'
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    marginTop: 5
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default PostScreen;
