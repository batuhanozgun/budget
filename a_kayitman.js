import { getFirestore, collection, addDoc, getDocs, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

const db = getFirestore();

export async function loadKayitTipleri() {
    const kayitTipiList = document.getElementById('kayitTipiList');
    kayitTipiList.innerHTML = '';

    const querySnapshot = await getDocs(query(collection(db, 'kayitTipleri'), orderBy('line')));

    querySnapshot.forEach((doc) => {
        const li = document.createElement('li');
        li.textContent = `${doc.data().name} (Sıra: ${doc.data().line})`;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Sil';
        deleteButton.addEventListener('click', () => deleteKayitTipi(doc.id));
        li.appendChild(deleteButton);
        kayitTipiList.appendChild(li);
    });
}

export async function loadKayitYonleri() {
    const kayitYonuList = document.getElementById('kayitYonuList');
    kayitYonuList.innerHTML = '';

    const querySnapshot = await getDocs(query(collection(db, 'kayitYonleri'), orderBy('line')));

    querySnapshot.forEach((doc) => {
        const li = document.createElement('li');
        li.textContent = `${doc.data().name} (Sıra: ${doc.data().line})`;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Sil';
        deleteButton.addEventListener('click', () => deleteKayitYonu(doc.id));
        li.appendChild(deleteButton);
        kayitYonuList.appendChild(li);
    });
}

export async function addKayitTipi() {
    const kayitTipiInput = document.getElementById('kayitTipiInput');
    const kayitTipi = kayitTipiInput.value;
    const line = parseInt(document.getElementById('kayitTipiLine').value, 10);

    try {
        await addDoc(collection(db, 'kayitTipleri'), { name: kayitTipi, line });
        kayitTipiInput.value = '';
        loadKayitTipleri();
    } catch (error) {
        console.error('Hata:', error);
        alert('Kayıt tipi eklenirken bir hata oluştu.');
    }
}

export async function addKayitYonu() {
    const kayitYonuInput = document.getElementById('kayitYonuInput');
    const kayitYonu = kayitYonuInput.value;
    const line = parseInt(document.getElementById('kayitYonuLine').value, 10);

    try {
        await addDoc(collection(db, 'kayitYonleri'), { name: kayitYonu, line });
        kayitYonuInput.value = '';
        loadKayitYonleri();
    } catch (error) {
        console.error('Hata:', error);
        alert('Kayıt yönü eklenirken bir hata oluştu.');
    }
}

export async function deleteKayitTipi(id) {
    try {
        await deleteDoc(doc(db, 'kayitTipleri', id));
        loadKayitTipleri();
    } catch (error) {
        console.error('Hata:', error);
        alert('Kayıt tipi silinirken bir hata oluştu.');
    }
}

export async function deleteKayitYonu(id) {
    try {
        await deleteDoc(doc(db, 'kayitYonleri', id));
        loadKayitYonleri();
    } catch (error) {
        console.error('Hata:', error);
        alert('Kayıt yönü silinirken bir hata oluştu.');
    }
}
