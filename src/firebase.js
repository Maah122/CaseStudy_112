import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAE8ByLf9BhtdY5aKa8axeRT7faqdaL4dw",
  authDomain: "itd112demo-adf2f.firebaseapp.com",
  projectId: "itd112demo-adf2f",
  storageBucket: "itd112demo-adf2f.firebasestorage.app",
  messagingSenderId: "608752633284",
  appId: "1:608752633284:web:de9bfc7e5a0b6743ead091",
  measurementId: "G-JFY594K1RX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firestore
const db = getFirestore(app);

export { db };
