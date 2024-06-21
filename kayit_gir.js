import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, addDoc, query, getDocs } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

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

// Kategori ve Alt Kategori Yükleme
async function loadCategories() {
    const categorySelect = document.getElementById('kategori');
    const altCategorySelect = document.getElementById('altKategori');

    const q = query(collection(db, 'categories'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = doc.data().name;
        categorySelect.appendChild(option);
    });

    categorySelect.addEventListener('change', async () => {
        altCategorySelect.innerHTML = '<option value="">Seçiniz</option>';
        const selectedCategory = categorySelect.value;
        if (selectedCategory) {
            const qAlt = query(collection(db, 'categories', selectedCategory, 'subcategories'));
            const querySnapshotAlt = await getDocs(qAlt);
            querySnapshotAlt.forEach((doc) => {
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = doc.data().name;
                altCategorySelect.appendChild(option);
            });
        }
    });
}

// Hesap Yükleme
async function loadAccounts() {
    const kaynakHesapSelect = document.getElementById('kaynakHesap');
    const hedefHesapSelect = document.getElementById('hedefHesap');

    const q = query(collection(db, 'accounts'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = doc.data().accountName; // Hesap Adı alanını kullanıyoruz
        kaynakHesapSelect.appendChild(option);
        hedefHesapSelect.appendChild(option.cloneNode(true)); // Hedef Hesap için aynı seçenekleri ekliyoruz
    });
}

loadCategories();
loadAccounts();

// Taksit Bilgileri Gösterme/Gizleme
document.getElementById('kaynakHesap').addEventListener('change', function () {
    const taksitBilgileri = document.getElementById('taksitBilgileri');
    const selectedOption = this.options[this.selectedIndex];
    if (selectedOption.text.includes('Kredi Kartı')) {
        taksitBilgileri.style.display = 'block';
    } else {
        taksitBilgileri.style.display = 'none';
    }
});

// Form Gönderme
document.getElementById('transactionForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const kayitTipi = document.getElementById('kayitTipi').value;
    const kayitYonu = document.getElementById('kayitYonu').value;
    const kaynakHesap = document.getElementById('kaynakHesap').value;
    const kategori = document.getElementById('kategori').value;
    const altKategori = document.getElementById('altKategori').value;
    const hedefHesap = document.getElementById('hedefHesap').value;
    const tutar = document.getElementById('tutar').value;
    const taksitAdedi = document.getElementById('taksitAdedi').value;
    const taksitTutar = document.getElementById('taksitTutar').value;

    try {
        await addDoc(collection(db, 'transactions'), {
            kayitTipi,
            kayitYonu,
            kaynakHesap,
            kategori,
            altKategori,
            hedefHesap,
            tutar: parseFloat(tutar),
            taksitAdedi: taksitAdedi ? parseInt(taksitAdedi) : null,
            taksitTutar: taksitTutar ? parseFloat(taksitTutar) : null,
            date: new Date(),
            userId: "currentUser" // Kullanıcı ID'si eklenmeli
        });
        alert('Kayıt başarıyla eklendi!');
        document.getElementById('transactionForm').reset();
        document.getElementById('taksitBilgileri').style.display = 'none';
    } catch (error) {
        console.error('Hata:', error);
        alert('Kayıt eklenirken bir hata oluştu.');
    }
});
