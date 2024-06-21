import { db } from './firebaseConfig.js';
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const transactions = await getTransactions();
    displayTransactions(transactions);
});

async function getTransactions() {
    const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
    const transactions = [];
    transactionsSnapshot.forEach(doc => {
        transactions.push(doc.data());
    });
    return transactions;
}

function displayTransactions(transactions) {
    const summaryTableBody = document.getElementById('summaryTable').getElementsByTagName('tbody')[0];

    transactions.forEach(transaction => {
        const row = summaryTableBody.insertRow();

        const accountNameCell = row.insertCell(0);
        const transactionDateCell = row.insertCell(1);
        const categoryCell = row.insertCell(2);
        const subCategoryCell = row.insertCell(3);
        const amountCell = row.insertCell(4);
        const transactionTypeCell = row.insertCell(5);

        accountNameCell.textContent = transaction.kaynakHesap; // Hesap adı
        transactionDateCell.textContent = transaction.islemTarihi; // İşlem tarihi
        categoryCell.textContent = transaction.kategori; // Kategori
        subCategoryCell.textContent = transaction.altKategori; // Alt kategori
        amountCell.textContent = transaction.tutar; // Tutar
        transactionTypeCell.textContent = transaction.kayitTipi; // İşlem tipi
    });
}
