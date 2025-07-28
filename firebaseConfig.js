// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: 'AIzaSyA4IBH8mBI6iTx_QxGNnf7VKLbgh3dVa4I',
  authDomain: 'newsarchive-41ec9.firebaseapp.com',
  projectId: 'newsarchive-41ec9',
  storageBucket: 'newsarchive-41ec9.appspot.com',
  messagingSenderId: '635802447680',
  appId: '1:635802447680:web:9f6f54cd0ca8d31bbed4a5',
  measurementId: 'G-QLYGS91LEQ'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
