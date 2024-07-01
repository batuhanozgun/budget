import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
import { firebaseConfig } from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function loadUsers() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';

    const querySnapshot = await getDocs(collection(db, 'users'));

    querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const lastLogin = userData.lastLogin ? new Date(userData.lastLogin.seconds * 1000).toLocaleString() : 'Bilinmiyor';
        const li = document.createElement('li');
        li.textContent = `${userData.email} (Son giriş: ${lastLogin})`;
        userList.appendChild(li);
    });
}

// İşlevi dışa aktar
export { loadUsers };
