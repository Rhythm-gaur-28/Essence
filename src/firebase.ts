import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC-dCO2CYPYu-ps_LQzi5jTQDNoVMFhQm8",
  authDomain: "essence-7165f.firebaseapp.com",
  projectId: "essence-7165f",
  storageBucket: "essence-7165f.firebasestorage.app",
  messagingSenderId: "1071774244279",
  appId: "1:1071774244279:web:fa3fa8aaae0109afcfdc32"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();