import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Firebase yapılandırmanızı buraya ekleyin
const firebaseConfig = {
    apiKey: "AIzaSyDidWK1ghqKTzokhT-YoqGb7Tz9w5AFjhM",
    authDomain: "batusbudget.firebaseapp.com",
    projectId: "batusbudget",
    storageBucket: "batusbudget.appspot.com",
    messagingSenderId: "1084998760222",
    appId: "1:1084998760222:web:d28492021d0ccefaf2bb0f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function loadUsers() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';

    const querySnapshot = await getDocs(collection(db, 'users'));

    querySnapshot.forEach((doc) => {
        const li = document.createElement('li');
        const userData = doc.data();
        const lastLogin = userData.lastLogin ? new Date(userData.lastLogin.seconds * 1000).toLocaleString() : 'Bilinmiyor';
        li.textContent = `${userData.email} (Son giriş: ${lastLogin})`;
        userList.appendChild(li);
    });
}
