// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

//import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
//import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAlstRH3tR1fbg8d3J_JBLdhkdjs7NHj68",
  authDomain: "habity-qrf.firebaseapp.com",
  projectId: "habity-qrf",
  storageBucket: "habity-qrf.firebasestorage.app",
  messagingSenderId: "325949668701",
  appId: "1:325949668701:web:f4581640325a95452c7cb4",
  measurementId: "G-MDTFED1G7H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Auth with AsyncStorage
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
  
  export { app , auth  };