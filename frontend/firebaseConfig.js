import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyC8xjCGzDpiMnUTP0yiFfZWiqiIqgdj5rc", // API key from Firebase console
    authDomain: "prayerwall-2f4c4.firebaseapp.com", // Auth domain from Firebase console
    databaseURL: "https://prayerwall-2f4c4-default-rtdb.firebaseio.com/", // Database URL from Firebase console
    projectId: "prayerwall-2f4c4", // Project ID from Firebase console
    storageBucket: "prayerwall-2f4c4.appspot.com", // Storage bucket from Firebase console
    messagingSenderId: "1001736195882", // Messaging sender ID from Firebase console
    appId: "1:1001736195882:ios:f8e1d481f8ceb47ee31853", // App ID from Firebase console
   // measurementId: "YOUR_MEASUREMENT_ID" // Measurement ID for Analytics (optional)
  };
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  export { auth };
  