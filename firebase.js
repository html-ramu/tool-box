import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0P0G9WZUurQAws7Bj8fob5QLkwrN3csQ",
  authDomain: "tool-box-7668e.firebaseapp.com",
  projectId: "tool-box-7668e",
  storageBucket: "tool-box-7668e.firebasestorage.app",
  messagingSenderId: "776985051892",
  appId: "1:776985051892:web:aaf3b55ba95bf04589d4a1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);