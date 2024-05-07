import { addDoc, collection } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

// Function to create a notification document
const createNotification = async (userId: string, type: string, message: string, postId: string) => {
    try {
        const notificationsRef = collection(firestore, 'notifications');
        await addDoc(notificationsRef, {
            userId: userId,
            type: type,
            message: message,
            postId: postId,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

export default createNotification;
