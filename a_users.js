import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { auth, db } from './firebaseConfig.js';

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

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadUsers();
    } else {
        window.location.href = 'login.html';
    }
});

export { loadUsers };
