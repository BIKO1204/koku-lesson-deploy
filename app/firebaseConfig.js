// プロジェクトルート直下に置いている firebaseConfig.js
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC8EyNS0V1ZlsFoF5UOnHalhfqovT2gmuo",
  authDomain: "koku-lesson-planner.firebaseapp.com",
  projectId: "koku-lesson-planner",
  storageBucket: "koku-lesson-planner.appspot.com",
  messagingSenderId: "269155400063",
  appId: "1:269155400063:web:8ce00951ab30826da9024a",
  measurementId: "G-XKCD1RXFW2"
};

// すでに初期化済みでなければ初期化
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// 互換版 Firestore と Auth をエクスポート
const db = firebase.firestore();
const auth = firebase.auth();

export { db, auth };
