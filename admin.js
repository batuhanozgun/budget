import { auth, db } from './firebaseConfig.js';
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { collection, getDocs, doc, getDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { checkAuth } from './auth.js';

document.getElementById('logoutButton').addEventListener('click', async () => {
    const messageDiv = document.getElementById('message');

    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Çıkış hatası: ', error);
        messageDiv.textContent = 'Çıkış hatası: ' + error.message;
        messageDiv.style.display = 'block';
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    showLoadingOverlay();
    const user = await checkAuth();
    if (user) {
        const transactions = await getAllTransactions();
        await displayTransactions(transactions);
    }
    hideLoadingOverlay();
});

async function getAllTransactions() {
    const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
    const transactions = [];
    transactionsSnapshot.forEach(doc => {
        transactions.push({ id: doc.id, ...doc.data() });
    });
    return transactions;
}

async function displayTransactions(transactions) {
    const tableBody = document.getElementById('transactionsTable').getElementsByTagName('tbody')[0];

    for (const transaction of transactions) {
        const row = tableBody.insertRow();

        const userIdCell = row.insertCell(0);
        const accountNameCell = row.insertCell(1);
        const transactionDateCell = row.insertCell(2);
        const categoryCell = row.insertCell(3);
        const subCategoryCell = row.insertCell(4);
        const amountCell = row.insertCell(5);
        const transactionTypeCell = row.insertCell(6);
        const actionsCell = row.insertCell(7);

        const accountDoc = await getDoc(doc(db, 'accounts', transaction.kaynakHesap));
        const accountName = accountDoc.exists() ? accountDoc.data().accountName : 'Unknown Account';

        const categoryDoc = await getDoc(doc(db, 'categories', transaction.kategori));
        const categoryName = categoryDoc.exists() ? categoryDoc.data().name : 'Unknown Category';

        const subCategoryDoc = await getDoc(doc(db, 'categories', transaction.kategori, 'subcategories', transaction.altKategori));
        const subCategoryName = subCategoryDoc.exists() ? subCategoryDoc.data().name : 'Unknown Subcategory';

        userIdCell.textContent = transaction.userId;
        accountNameCell.textContent = accountName;
        transactionDateCell.textContent = new Date(transaction.islemTarihi).toLocaleDateString();
        categoryCell.textContent = categoryName;
        subCategoryCell.textContent = subCategoryName;
        amountCell.textContent = formatNumber(transaction.tutar);
        transactionTypeCell.textContent = transaction.kayitTipi;

        const editButton = document.createElement('button');
        editButton.textContent = 'Düzenle';
        editButton.onclick = () => editTransaction(transaction.id);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Sil';
        deleteButton.onclick = () => deleteTransaction(transaction.id);

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
    }
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

async function editTransaction(transactionId) {
    const newAmount = prompt("Yeni tutarı girin:");
    if (newAmount !== null) {
        await updateDoc(doc(db, 'transactions', transactionId), {
            tutar: parseFloat(newAmount)
        });
        location.reload(); // Sayfayı yeniden yükleyerek güncellenmiş verileri göster
    }
}

async function deleteTransaction(transactionId) {
    if (confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
        await deleteDoc(doc(db, 'transactions', transactionId));
        location.reload(); // Sayfayı yeniden yükleyerek güncellenmiş verileri göster
    }
}

function showLoadingOverlay() {
    document.querySelector('.loading-overlay').style.display = 'flex';
}

function hideLoadingOverlay() {
    document.querySelector('.loading-overlay').style.display = 'none';
}
