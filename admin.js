import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";
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
        loadUsers();
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

async function loadUsers() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';

    const querySnapshot = await getDocs(collection(db, 'users'));

    querySnapshot.forEach((doc) => {
        const li = document.createElement('li');
        li.textContent = `${doc.data().email} (Son giriş: ${doc.data().lastLogin || 'Bilinmiyor'})`;
        userList.appendChild(li);
    });
}

async function loadKayitTipleri() {
    const kayitTipiList = document.getElementById('kayitTipiList');
    kayitTipiList.innerHTML = '';

    const querySnapshot = await getDocs(collection(db, 'kayitTipleri', orderBy("line")));

    querySnapshot.forEach((doc) => {
        const li = document.createElement('li');
        li.textContent = `${doc.data().name} (Sıra: ${doc.data().line})`;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Sil';
        deleteButton.addEventListener('click', () => deleteKayitTipi(doc.id));
        const upButton = document.createElement('button');
        upButton.textContent = 'Yukarı';
        upButton.addEventListener('click', () => moveKayitTipi(doc.id, -1));
        const downButton = document.createElement('button');
        downButton.textContent = 'Aşağı';
        downButton.addEventListener('click', () => moveKayitTipi(doc.id, 1));
        li.appendChild(upButton);
        li.appendChild(downButton);
        li.appendChild(deleteButton);
        kayitTipiList.appendChild(li);
    });
}

async function loadKayitYonleri() {
    const kayitYonuList = document.getElementById('kayitYonuList');
    kayitYonuList.innerHTML = '';

    const querySnapshot = await getDocs(collection(db, 'kayitYonleri', orderBy("line")));

    querySnapshot.forEach((doc) => {
        const li = document.createElement('li');
        li.textContent = `${doc.data().name} (Sıra: ${doc.data().line})`;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Sil';
        deleteButton.addEventListener('click', () => deleteKayitYonu(doc.id));
        const upButton = document.createElement('button');
        upButton.textContent = 'Yukarı';
        upButton.addEventListener('click', () => moveKayitYonu(doc.id, -1));
        const downButton = document.createElement('button');
        downButton.textContent = 'Aşağı';
        downButton.addEventListener('click', () => moveKayitYonu(doc.id, 1));
        li.appendChild(upButton);
        li.appendChild(downButton);
        li.appendChild(deleteButton);
        kayitYonuList.appendChild(li);
    });
}

async function addKayitTipi() {
    const kayitTipiInput = document.getElementById('kayitTipiInput');
    const kayitTipi = kayitTipiInput.value;

    try {
        const querySnapshot = await getDocs(collection(db, 'kayitTipleri'));
        const line = querySnapshot.size + 1;
        await addDoc(collection(db, 'kayitTipleri'), { name: kayitTipi, line: line });
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
        const querySnapshot = await getDocs(collection(db, 'kayitYonleri'));
        const line = querySnapshot.size + 1;
        await addDoc(collection(db, 'kayitYonleri'), { name: kayitYonu, line: line });
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

async function moveKayitTipi(id, direction) {
    try {
        const docRef = doc(db, 'kayitTipleri', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const currentLine = docSnap.data().line;
            const newLine = currentLine + direction;

            // Belirtilen sıraya sahip başka bir belge var mı kontrol et
            const q = query(collection(db, 'kayitTipleri'), where("line", "==", newLine));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Diğer belgenin sırasını güncelle
                const otherDoc = querySnapshot.docs[0];
                await updateDoc(doc(db, 'kayitTipleri', otherDoc.id), { line: currentLine });
            }

            // Belgeyi yeni sıraya güncelle
            await updateDoc(docRef, { line: newLine });
            loadKayitTipleri();
        }
    } catch (error) {
        console.error('Hata:', error);
        alert('Kayıt tipi taşınırken bir hata oluştu.');
    }
}

async function moveKayitYonu(id, direction) {
    try {
        const docRef = doc(db, 'kayitYonleri', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const currentLine = docSnap.data().line;
            const newLine = currentLine + direction;

            // Belirtilen sıraya sahip başka bir belge var mı kontrol et
            const q = query(collection(db, 'kayitYonleri'), where("line", "==", newLine));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Diğer belgenin sırasını güncelle
                const otherDoc = querySnapshot.docs[0];
                await updateDoc(doc(db, 'kayitYonleri', otherDoc.id), { line: currentLine });
            }

            // Belgeyi yeni sıraya güncelle
            await updateDoc(docRef, { line: newLine });
            loadKayitYonleri();
        }
    } catch (error) {
        console.error('Hata:', error);
        alert('Kayıt yönü taşınırken bir hata oluştu.');
    }
}
