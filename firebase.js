// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
const firebaseConfig = {
  apiKey: "AIzaSyCshuL3rg4AHKCpB4xrjhAZgFf1IE6WGSs",
  authDomain: "the-fusion-ad4ed.firebaseapp.com",
  projectId: "the-fusion-ad4ed",
  storageBucket: "the-fusion-ad4ed.appspot.com",
  messagingSenderId: "90965635226",
  appId: "1:90965635226:web:ee8bbfcdf906cff93eaf23",
  measurementId: "G-K2W3BZLWDD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;