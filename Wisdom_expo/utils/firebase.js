import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: ".",
    authDomain: "wisdom-63348.firebaseapp.com",
    projectId: "wisdom-63348",
    storageBucket: "wisdom-63348.firebasestorage.app",
    messagingSenderId: "967795282240",
    appId: "1:967795282240:web:08c4bffbfb14fab36deaa5",
    measurementId: "G-VJ3365L42Q"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;