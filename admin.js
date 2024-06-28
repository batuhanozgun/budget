import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

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
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadKayitTipleri();
        loadKayitYonleri();
        document.getElementById('kayitTipiForm').addEventListener('submit', (e) => {
            e.preventDefault();
            addKayitTipi();
        });
        document.getElementById('kayitYonuForm').addEventListener('submit', (e) => {
            e.preventDefault();
            addKayitYonu();
        });
    } else {
        // Kullanıcı oturumu kapatıldıysa login sayfasına yönlendirin
        window.location.href = 'login.html';
    }
});

async function loadKayitTipleri() {
    const kayitTipiList = document.getElementById('kayitTipiList');
    kayitTipiList.innerHTML = '';

    const querySnapshot = await getDocs(collection(db, 'kayitTipleri'));

    querySnapshot.forEach((doc) => {
        const li = document.createElement('li');
        li.textContent = doc.data().name;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Sil';
        deleteButton.addEventListener('click', () => deleteKayitTipi(doc.id));
        li.appendChild(deleteButton);
        kayitTipiList.appendChild(li);
    });
}

async function loadKayitYonleri() {
    const kayitYonuList = document.getElementById('kayitYonuList');
    kayitYonuList.innerHTML = '';

    const querySnapshot = await getDocs(collection(db, 'kayitYonleri'));

    querySnapshot.forEach((doc) => {
        const li = document.createElement('li');
        li.textContent = doc.data().name;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Sil';
        deleteButton.addEventListener('click', () => deleteKayitYonu(doc.id));
        li.appendChild(deleteButton);
        kayitYonuList.appendChild(li);
    });
}

async function addKayitTipi() {
    const kayitTipiInput = document.getElementById('kayitTipiInput');
    const kayitTipi = kayitTipiInput.value;

    try {
        await addDoc(collection(db, 'kayitTipleri'), { name: kayitTipi });
        kayitTipiInput.value = '';
        loadKayitTipleri();
    } catch (error) {
        console.error('Hata:', error);
        alert('Kayıt tipi eklenirken bir hata oluştu.');
    }
}

async function addKayitYonu() {
    const kayitYonuInput = document.getElementById('kayitYonuInput');
    const kayitYonu = kayitYonuInput.value;

    try {
        await addDoc(collection(db, 'kayitYonleri'), { name: kayitYonu });
        kayitYonuInput.value = '';
        loadKayitYonleri();
    } catch (error) {
        console.error('Hata:', error);
        alert('Kayıt yönü eklenirken bir hata oluştu.');
    }
}

async function deleteKayitTipi(id) {
    try {
        await deleteDoc(doc(db, 'kayitTipleri', id));
        loadKayitTipleri();
    } catch (error) {
        console.error('Hata:', error);
        alert('Kayıt tipi silinirken bir hata oluştu.');
    }
}

async function deleteKayitYonu(id) {
    try {
        await deleteDoc(doc(db, 'kayitYonleri', id));
        loadKayitYonleri();
    } catch (error) {
        console.error('Hata:', error);
        alert('Kayıt yönü silinirken bir hata oluştu.');
    }
}
