import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAx5dQW4PwQqXLliP2kq43bzN8vkABkviw",
  authDomain: "zwippetest-310ba.firebaseapp.com",
  projectId: "zwippetest-310ba",
  storageBucket: "zwippetest-310ba.appspot.com",
  messagingSenderId: "442939934986",
  appId: "1:442939934986:web:45e09b3c37d315729ed2f3",
  measurementId: "G-RHLYRDMM8B"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
