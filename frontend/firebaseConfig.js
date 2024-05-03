import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyC8xjCGzDpiMnUTP0yiFfZWiqiIqgdj5rc",
    authDomain: " prayerwall-2f4c4.firebaseapp.com ",
    projectId: "prayerwall-2f4c4",
    storageBucket: "prayerwall-2f4c4.appspot.com",
    messagingSenderId: "1001736195882",
    appId: "1:1001736195882:ios:f8e1d481f8ceb47ee31853"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with React Native persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firebase Realtime Database
const database = getDatabase(app);

// Initialize Cloud Firestore
const firestore = getFirestore(app);

console.log("Firebase App Initialized:", app);
console.log("Firebase Auth Initialized:", auth);
console.log("Firebase Database Initialized:", database);
console.log("Firebase Firestore Initialized:", firestore);

export { auth, database, firestore };
