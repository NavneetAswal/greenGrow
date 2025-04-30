// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMtyqPhgWdoupdnA4dzKrd365hRaqKqyo",
  authDomain: "greengrow25-b61c8.firebaseapp.com",
  projectId: "greengrow25-b61c8",
  storageBucket: "greengrow25-b61c8.firebasestorage.app",
  messagingSenderId: "849823338505",
  appId: "1:849823338505:web:c6aad8f1c4c7a5c69fe8d8",
  measurementId: "G-EBB4KBQXZW",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(); // Optional for future database use
