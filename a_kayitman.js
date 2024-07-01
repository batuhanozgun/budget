import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { db } from './firebaseConfig.js';

async function loadKayitTipleri() {
    const kayitTipiList = document.getElementById('kayitTipiList');
    kayitTipiList.innerHTML = '';

    const q = query(collection(db, 'kayitTipleri'), orderBy('line'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const li = document.createElement('li');
        li.textContent = `${doc.data().name} (Sıra: ${doc.data().line})`;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Sil';
        deleteButton.addEventListener('click', () => deleteKayitTipi(doc.id));
        const editButton = document.createElement('button');
        editButton.textContent = 'Düzenle';
        editButton.addEventListener('click', () => editKayitTipi(doc.id, doc.data().name, doc.data().line));
        li.appendChild(deleteButton);
        li.appendChild(editButton);
        kayitTipiList.appendChild(li);
    });
}

async function loadKayitYonleri() {
    const kayitYonuList = document.getElementById('kayitYonuList');
    kayitYonuList.innerHTML = '';

    const q = query(collection(db, 'kayitYonleri'), orderBy('line'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const li = document.createElement('li');
        li.textContent = `${doc.data().name} (Sıra: ${doc.data().line})`;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Sil';
        deleteButton.addEventListener('click', () => deleteKayitYonu(doc.id));
        const editButton = document.createElement('button');
        editButton.textContent = 'Düzenle';
        editButton.addEventListener('click', () => editKayitYonu(doc.id, doc.data().name, doc.data().line));
        li.appendChild(deleteButton);
        li.appendChild(editButton);
        kayitYonuList.appendChild(li);
    });
}

async function addKayitTipi() {
    const kayitTipiInput = document.getElementById('kayitTipiInput');
    const kayitTipiLineInput = document.getElementById('kayitTipiLineInput');
    const kayitTipi = kayitTipiInput.value;
    const line = parseInt(kayitTipiLineInput.value, 10);

    try {
        await addDoc(collection(db, 'kayitTipleri'), { name: kayitTipi, line: line });
        kayitTipiInput.value = '';
        kayitTipiLineInput.value = '';
        loadKayitTipleri();
    } catch (error) {
        alert('Kayıt tipi eklenirken bir hata oluştu.');
    }
}

async function addKayitYonu() {
    const kayitYonuInput = document.getElementById('kayitYonuInput');
    const kayitYonuLineInput = document.getElementById('kayitYonuLineInput');
    const kayitYonu = kayitYonuInput.value;
    const line = parseInt(kayitYonuLineInput.value, 10);

    try {
        await addDoc(collection(db, 'kayitYonleri'), { name: kayitYonu, line: line });
        kayitYonuInput.value = '';
        kayitYonuLineInput.value = '';
        loadKayitYonleri();
    } catch (error) {
        alert('Kayıt yönü eklenirken bir hata oluştu.');
    }
}

async function deleteKayitTipi(id) {
    try {
        await deleteDoc(doc(db, 'kayitTipleri', id));
        loadKayitTipleri();
    } catch (error) {
        alert('Kayıt tipi silinirken bir hata oluştu.');
    }
}

async function deleteKayitYonu(id) {
    try {
        await deleteDoc(doc(db, 'kayitYonleri', id));
        loadKayitYonleri();
    } catch (error) {
        alert('Kayıt yönü silinirken bir hata oluştu.');
    }
}

async function editKayitTipi(id, currentName, currentLine) {
    const newName = prompt("Yeni kayıt tipi adını girin:", currentName);
    const newLine = prompt("Yeni sıralama numarasını girin:", currentLine);
    if (newName !== null && newLine !== null) {
        try {
            await updateDoc(doc(db, 'kayitTipleri', id), { name: newName, line: parseInt(newLine, 10) });
            loadKayitTipleri();
        } catch (error) {
            alert('Kayıt tipi düzenlenirken bir hata oluştu.');
        }
    }
}

async function editKayitYonu(id, currentName, currentLine) {
    const newName = prompt("Yeni kayıt yönü adını girin:", currentName);
    const newLine = prompt("Yeni sıralama numarasını girin:", currentLine);
    if (newName !== null && newLine !== null) {
        try {
            await updateDoc(doc(db, 'kayitYonleri', id), { name: newName, line: parseInt(newLine, 10) });
            loadKayitYonleri();
        } catch (error) {
            alert('Kayıt yönü düzenlenirken bir hata oluştu.');
        }
    }
}

// İşlevleri dışa aktar
export { loadKayitTipleri, loadKayitYonleri, addKayitTipi, addKayitYonu };
