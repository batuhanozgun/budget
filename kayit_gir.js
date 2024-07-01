import { app, auth, db, doc, getDoc } from './firebaseConfig.js';
import { collection, addDoc, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

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

        document.getElementById('kaynakHesap').addEventListener('change', handleKaynakHesapChange);
        document.getElementById('taksitVarMi').addEventListener('change', handleTaksitVarMiChange);
    } else {
        window.location.href = 'login.html';
    }
});

function handleKaynakHesapChange() {
    const kaynakHesapSelect = document.getElementById('kaynakHesap');
    const taksitSecenekleri = document.getElementById('taksitSecenekleri');
    const taksitBilgileri = document.getElementById('taksitBilgileri');
    
    if (kaynakHesapSelect.value) {
        getDoc(doc(db, 'accounts', kaynakHesapSelect.value)).then((docSnapshot) => {
            if (docSnapshot.exists()) {
                if (docSnapshot.data().accountType === 'krediKarti') {
                    taksitSecenekleri.classList.remove('hidden');
                    taksitBilgileri.classList.add('hidden');
                } else {
                    taksitSecenekleri.classList.add('hidden');
                    taksitBilgileri.classList.add('hidden');
                }
            } else {
                taksitSecenekleri.classList.add('hidden');
                taksitBilgileri.classList.add('hidden');
            }
        }).catch((error) => {
            console.error("Error fetching account data:", error);
            taksitSecenekleri.classList.add('hidden');
            taksitBilgileri.classList.add('hidden');
        });
    } else {
        taksitSecenekleri.classList.add('hidden');
        taksitBilgileri.classList.add('hidden');
    }
}

function handleTaksitVarMiChange() {
    const taksitVarMiSelect = document.getElementById('taksitVarMi');
    const taksitBilgileri = document.getElementById('taksitBilgileri');
    
    if (taksitVarMiSelect.value === 'evet') {
        taksitBilgileri.classList.remove('hidden');
    } else {
        taksitBilgileri.classList.add('hidden');
    }
}

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

    kayitYonuSelect.addEventListener('change', async () => {
        const selectedKayitYonu = kayitYonuSelect.value;
        const kayitYonuDoc = await getDoc(doc(db, 'kayitYonleri', selectedKayitYonu));
        const kayitYonuData = kayitYonuDoc.data();
        const hedefHesapDiv = document.getElementById('hedefHesapDiv');

        if (kayitYonuData.name === 'Harcama') {
            hedefHesapDiv.style.display = 'none';
        } else {
            hedefHesapDiv.style.display = 'block';
        }
    });
}

async function saveTransaction(uid) {
    const kayitTipi = document.getElementById('kayitTipi').value;
    const kayitYonu = document.getElementById('kayitYonu').value;
    const kaynakHesap = document.getElementById('kaynakHesap').value;
    const kategori = document.getElementById('kategori').value;
    const altKategori = document.getElementById('altKategori').value;
    const hedefHesap = document.getElementById('hedefHesap').value || "-";
    let tutar = parseFloat(document.getElementById('tutar').value);
    const taksitAdedi = parseInt(document.getElementById('taksitAdedi').value) || 1;
    const islemTarihi = document.getElementById('islemTarihi').value;
    const detay = document.getElementById('detay').value;

    const kayitTipiDoc = await getDoc(doc(db, 'kayitTipleri', kayitTipi));
    const kayitTipiData = kayitTipiDoc.data();
    if (kayitTipiData.name === 'Gider') {
        tutar = -Math.abs(tutar);
    }

    try {
        const mainTransactionRef = await addDoc(collection(db, 'transactions'), {
            userId: uid,
            kayitTipi: kayitTipi,
            kayitYonu: kayitYonu,
            kaynakHesap: kaynakHesap,
            kategori: kategori,
            altKategori: altKategori,
            hedefHesap: hedefHesap,
            tutar: tutar,
            taksitAdedi: taksitAdedi,
            islemTarihi: new Date(islemTarihi),
            createDate: new Date(),
            detay: detay
        });

        if (document.getElementById('taksitVarMi').value === 'evet' && taksitAdedi > 1) {
            const taksitTutar = tutar / taksitAdedi;
            for (let i = 0; i < taksitAdedi; i++) {
                const taksitTarihi = new Date(islemTarihi);
                taksitTarihi.setMonth(taksitTarihi.getMonth() + i);
                await addDoc(collection(db, `transactions/${mainTransactionRef.id}/creditcardInstallments`), {
                    tutar: taksitTutar,
                    taksitTarihi: taksitTarihi,
                    taksitPlani: `${i + 1}/${taksitAdedi}`,
                    createDate: new Date()
                });
            }
        }

        document.getElementById('transactionForm').reset();
        showMessage('Kayıt başarıyla eklendi.');
    } catch (error) {
        console.error('Hata:', error);
        showMessage('Kayıt eklenirken bir hata oluştu.');
    }
}

function showMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}
