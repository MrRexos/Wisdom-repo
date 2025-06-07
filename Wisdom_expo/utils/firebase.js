import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBMRVaUV1DSj6rpPTg8c01YEJdnTK4A52A',
  authDomain: 'wisdom-6475e.firebaseapp.com',
  projectId: 'wisdom-6475e',
  storageBucket: 'wisdom-6475e.appspot.com',
  messagingSenderId: '1059564042301',
  appId: '1:1059564042301:web:69e6ac37592e920f151254',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
