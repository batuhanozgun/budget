import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadUsers();
    } else {
        window.location.href = 'login.html';
    }
});

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
