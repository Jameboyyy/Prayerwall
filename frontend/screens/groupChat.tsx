import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const GroupChat = ({ route }) => {
  const { userId } = route.params; // Get userId from navigation parameter
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const firestore = getFirestore();

  useEffect(() => {
    const messagesCollection = collection(firestore, 'messages'); // Assume 'messages' stores all messages
    const q = query(messagesCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messages);
    });

    return () => unsubscribe();
  }, [userId]); // Re-run effect if userId changes

  const sendMessage = async () => {
    if (inputText.trim()) {
      await addDoc(collection(firestore, 'messages'), {
        text: inputText,
        userId, // Store userId with message
        createdAt: new Date(),
      });
      setInputText('');
    }
  };

  // Render logic here...

  return (
    // JSX for chat UI
  );
};

// Styles here...

export default GroupChat;
