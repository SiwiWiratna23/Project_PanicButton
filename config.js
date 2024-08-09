import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyAinn6m2ileh2HXpDDPlE4m3l3er8nboZw",
  databaseURL: "https://panicbutton-6fc62-default-rtdb.asia-southeast1.firebasedatabase.app",
  authDomain: "panicbutton-6fc62.firebaseapp.com",
  projectId: "panicbutton-6fc62",
  storageBucket: "panicbutton-6fc62.appspot.com",
  messagingSenderId: "1075601554158",
  appId: "1:1075601554158:web:67f781b04b37e0ec05d1ff",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const firestore = firebase.firestore();

export default firestore;
