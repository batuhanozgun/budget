import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";
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
        loadAccounts(user.uid);
        loadCategories(user.uid);
        loadKayitTipleri();
        loadKayitYonleri();
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            saveTransaction(user.uid);
        });
    } else {
        // Kullanıcı oturumu kapatıldıysa login sayfasına yönlendirin
        window.location.href = 'login.html';
    }
});

async function loadAccounts(uid) {
    const accountSelect = document.getElementById('kaynakHesap');
    const targetAccountSelect = document.getElementById('hedefHesap');
    accountSelect.innerHTML = '<option value="">Seçiniz</option>';
    targetAccountSelect.innerHTML = '<option value="">Seçiniz</option>';

    const q = query(collection(db, 'accounts'), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = doc.data().accountName;
        accountSelect.appendChild(option);
        targetAccountSelect.appendChild(option.cloneNode(true));
    });
}

async function loadCategories(uid) {
    const categorySelect = document.getElementById('kategori');
    categorySelect.innerHTML = '<option value="">Seçiniz</option>';

    const q = query(collection(db, 'categories'), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = doc.data().name;
        categorySelect.appendChild(option);
    });

    categorySelect.addEventListener('change', () => loadSubCategories(uid));
}

async function loadSubCategories(uid) {
    const categorySelect = document.getElementById('kategori');
    const subCategorySelect = document.getElementById('altKategori');
    subCategorySelect.innerHTML = '<option value="">Seçiniz</option>';

    const selectedCategory = categorySelect.value;
    if (selectedCategory) {
        const q = query(collection(db, 'categories', selectedCategory, 'subcategories'), where("userId", "==", uid));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = doc.data().name;
            subCategorySelect.appendChild(option);
        });
    }
}

async function loadKayitTipleri() {
    const kayitTipiSelect = document.getElementById('kayitTipi');
    kayitTipiSelect.innerHTML = '<option value="">Seçiniz</option>';

    const q = query(collection(db, 'kayitTipleri'), orderBy('line'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = doc.data().name;
        kayitTipiSelect.appendChild(option);
    });
}

async function loadKayitYonleri() {
    const kayitYonuSelect = document.getElementById('kayitYonu');
    kayitYonuSelect.innerHTML = '<option value="">Seçiniz</option>';

    const q = query(collection(db, 'kayitYonleri'), orderBy('line'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = doc.data().name;
        kayitYonuSelect.appendChild(option);
    });
}

async function saveTransaction(uid) {
    const kayitTipi = document.getElementById('kayitTipi').value;
    const kayitYonu = document.getElementById('kayitYonu').value;
    const kaynakHesap = document.getElementById('kaynakHesap').value;
    const kategori = document.getElementById('kategori').value;
    const altKategori = document.getElementById('altKategori').value;
    const hedefHesap = document.getElementById('hedefHesap').value;
    const tutarElement = document.getElementById('tutar');
    const taksitAdedi = document.getElementById('taksitAdedi').value;
    const taksitTutar = document.getElementById('taksitTutar').value;
    const islemTarihi = document.getElementById('islemTarihi').value;

    // Tutarı güncelleme işlemi
    let tutar = parseFloat(tutarElement.value);
    if (kayitTipi === 'Gider') {
        tutar = -Math.abs(tutar);
    } else if (kayitTipi === 'Gelir') {
        tutar = Math.abs(tutar);
    }

    try {
        if (kaynakHesap === 'krediKarti' && taksitAdedi > 0) {
            for (let i = 0; i < taksitAdedi; i++) {
                const taksitTarihi = new Date(islemTarihi);
                taksitTarihi.setMonth(taksitTarihi.getMonth() + i);
                await addDoc(collection(db, 'transactions'), {
                    userId: uid,
                    kayitTipi: kayitTipi,
                    kayitYonu: kayitYonu,
                    kaynakHesap: kaynakHesap,
                    kategori: kategori,
                    altKategori: altKategori,
                    hedefHesap: hedefHesap,
                    tutar: taksitTutar,
                    taksitAdedi: taksitAdedi,
                    taksitTutar: taksitTutar,
                    islemTarihi: taksitTarihi,
                    date: new Date()
                });
            }
        } else {
            await addDoc(collection(db, 'transactions'), {
                userId: uid,
                kayitTipi: kayitTipi,
                kayitYonu: kayitYonu,
                kaynakHesap: kaynakHesap,
                kategori: kategori,
                altKategori: altKategori,
                hedefHesap: hedefHesap,
                tutar: tutar,
                taksitAdedi: taksitAdedi,
                taksitTutar: taksitTutar,
                islemTarihi: islemTarihi,
                date: new Date()
            });
        }
        document.getElementById('transactionForm').reset();
        alert('Kayıt başarıyla eklendi.');
    } catch (error) {
        console.error('Hata:', error);
        alert('Kayıt eklenirken bir hata oluştu.');
    }
}

document.getElementById('kaynakHesap').addEventListener('change', () => {
    const kaynakHesap = document.getElementById('kaynakHesap').value;
    const hedefHesapLabel = document.getElementById('hedefHesapLabel');
    const hedefHesap = document.getElementById('hedefHesap');
    const taksitAdediLabel = document.getElementById('taksitAdediLabel');
    const taksitAdedi = document.getElementById('taksitAdedi');
    const taksitTutarLabel = document.getElementById('taksitTutarLabel');
    const taksitTutar = document.getElementById('taksitTutar');

    if (kaynakHesap === 'krediKarti') {
        hedefHesapLabel.style.display = 'none';
        hedefHesap.style.display = 'none';
        taksitAdediLabel.style.display = 'block';
        taksitAdedi.style.display = 'block';
        taksitTutarLabel.style.display = 'block';
        taksitTutar.style.display = 'block';
    } else {
        hedefHesapLabel.style.display = 'block';
        hedefHesap.style.display = 'block';
        taksitAdediLabel.style.display = 'none';
        taksitAdedi.style.display = 'none';
        taksitTutarLabel.style.display = 'none';
        taksitTutar.style.display = 'none';
    }
});
