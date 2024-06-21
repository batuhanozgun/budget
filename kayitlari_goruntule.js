import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, query, getDocs, where, doc, getDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";
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
        loadTransactions(user.uid);
    } else {
        // Kullanıcı oturumu kapatıldıysa login sayfasına yönlendirin
        window.location.href = 'login.html';
    }
});

async function loadTransactions(uid) {
    const q = query(collection(db, 'transactions'), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);

    const tableBody = document.getElementById('transactionsTableBody');
    tableBody.innerHTML = '';

    for (const transactionDoc of querySnapshot.docs) {
        const data = transactionDoc.data();
        const transactionId = transactionDoc.id;

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${data.kayitTipi || ''}</td>
            <td>${data.kayitYonu || ''}</td>
            <td>${data.kaynakHesap || ''}</td>
            <td>${data.kategori || ''}</td>
            <td>${data.altKategori || ''}</td>
            <td>${data.hedefHesap || ''}</td>
            <td>${data.tutar || ''}</td>
            <td>${data.taksitAdedi || ''}</td>
            <td>${data.taksitTutar || ''}</td>
            <td>${new Date(data.islemTarihi).toLocaleDateString()}</td>
            <td>${new Date(data.date.seconds * 1000).toLocaleDateString()}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="editTransaction('${transactionId}')">Düzenle</button>
                    <button onclick="deleteTransaction('${transactionId}')">Sil</button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    }
}

document.getElementById('searchInput').addEventListener('input', filterTransactions);

function filterTransactions() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.getElementById('transactionsTableBody').getElementsByTagName('tr');

    for (const row of rows) {
        const cells = row.getElementsByTagName('td');
        let match = false;
        for (const cell of cells) {
            if (cell.textContent.toLowerCase().includes(searchText)) {
                match = true;
                break;
            }
        }
        row.style.display = match ? '' : 'none';
    }
}

window.deleteTransaction = async (transactionId) => {
    if (confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
        await deleteDoc(doc(db, 'transactions', transactionId));
        loadTransactions(auth.currentUser.uid);
    }
};

window.editTransaction = async (transactionId) => {
    const newAmount = prompt("Yeni tutarı girin:");
    if (newAmount !== null) {
        await updateDoc(doc(db, 'transactions', transactionId), {
            tutar: parseFloat(newAmount)
        });
        loadTransactions(auth.currentUser.uid);
    }
};
