// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from '@firebase/firestore'
const firebaseConfig = {
  apiKey: "AIzaSyDYk9hvTpM0bdhOENJu1-4waIdY3y3xyEk",
  authDomain: "sgsgsggsdgsg.firebaseapp.com",
  projectId: "sgsgsggsdgsg",
  storageBucket: "sgsgsggsdgsg.firebasestorage.app",
  messagingSenderId: "349912716871",
  appId: "1:349912716871:web:050685dbdcd14dd9dcc362"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);