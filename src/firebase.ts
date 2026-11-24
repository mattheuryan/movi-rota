import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// COLE AQUI as suas chaves (o mesmo bloco que você já tinha)
const firebaseConfig = {
  apiKey: 'AIzaSyDXdprL0ggvEU2LYSmmL0LQYDRLRfFyJYs',
  authDomain: 'app-rotas-ce2ac.firebaseapp.com',
  projectId: 'app-rotas-ce2ac',
  storageBucket: 'app-rotas-ce2ac.firebasestorage.app',
  messagingSenderId: '1035518791521',
  appId: '1:1035518791521:web:9f5e51db3fe7171bfb7f20',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});