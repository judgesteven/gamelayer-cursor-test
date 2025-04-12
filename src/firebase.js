import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAKPZ7MBXWag0lS5WJ6FxJ6dMmWsk2E0NM",
  authDomain: "gamelayer-test.firebaseapp.com",
  projectId: "gamelayer-test",
  storageBucket: "gamelayer-test.firebasestorage.app",
  messagingSenderId: "221324243524",
  appId: "1:221324243524:web:7f73bf03f2b74e05584211",
  measurementId: "G-MDPWVWZ44S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { auth, analytics }; 