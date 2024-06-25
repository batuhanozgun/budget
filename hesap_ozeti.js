import { db } from './firebaseConfig.js';
import { getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const auth = getAuth();

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const transactions = await getTransactions(user.uid);
            displayTransactions(transactions);
            displayAccountBalances(transactions);
            displayCategoryBalances(transactions);
        } else {
            // Kullanıcı oturumu kapatıldıysa login sayfasına yönlendirin
            window.location.href = 'login.html';
        }
    });
});

async function getTransactions(uid) {
    const q = query(collection(db, 'transactions'), where('userId', '==', uid));
    const transactionsSnapshot = await getDocs(q);
    const transactions = [];
    transactionsSnapshot.forEach(doc => {
        transactions.push({ id: doc.id, ...doc.data() });
    });
    return transactions;
}

function displayTransactions(transactions) {
    const summaryTableBody = document.getElementById('summaryTable').getElementsByTagName('tbody')[0];
    summaryTableBody.innerHTML = '';  // Tablodaki önceki verileri temizle

    transactions.forEach(transaction => {
        const row = summaryTableBody.insertRow();

        const accountNameCell = row.insertCell(0);
        const transactionDateCell = row.insertCell(1);
        const categoryCell = row.insertCell(2);
        const subCategoryCell = row.insertCell(3);
        const amountCell = row.insertCell(4);
        const transactionTypeCell = row.insertCell(5);

        accountNameCell.textContent = transaction.kaynakHesap; // Hesap adı
        transactionDateCell.textContent = new Date(transaction.islemTarihi).toLocaleDateString(); // İşlem tarihi
        categoryCell.textContent = transaction.kategori; // Kategori
        subCategoryCell.textContent = transaction.altKategori; // Alt kategori
        amountCell.textContent = transaction.tutar; // Tutar
        transactionTypeCell.textContent = transaction.kayitTipi; // İşlem tipi
    });
}

function displayAccountBalances(transactions) {
    const accountBalances = {};
    transactions.forEach(transaction => {
        const account = transaction.kaynakHesap;
        const amount = parseFloat(transaction.tutar);
        if (!accountBalances[account]) {
            accountBalances[account] = 0;
        }
        if (transaction.kayitTipi === 'Gelir') {
            accountBalances[account] += amount;
        } else if (transaction.kayitTipi === 'Gider') {
            accountBalances[account] -= amount;
        }
    });

    const accountBalancesTableBody = document.getElementById('accountBalancesTable').getElementsByTagName('tbody')[0];
    accountBalancesTableBody.innerHTML = '';  // Tablodaki önceki verileri temizle

    for (const [account, balance] of Object.entries(accountBalances)) {
        const row = accountBalancesTableBody.insertRow();
        const accountCell = row.insertCell(0);
        const balanceCell = row.insertCell(1);

        accountCell.textContent = account;
        balanceCell.textContent = balance.toFixed(2);
    }
}

function displayCategoryBalances(transactions) {
    const categoryBalances = {};
    transactions.forEach(transaction => {
        const category = transaction.kategori;
        const amount = parseFloat(transaction.tutar);
        if (!categoryBalances[category]) {
            categoryBalances[category] = 0;
        }
        if (transaction.kayitTipi === 'Gelir') {
            categoryBalances[category] += amount;
        } else if (transaction.kayitTipi === 'Gider') {
            categoryBalances[category] -= amount;
        }
    });

    const categoryBalancesTableBody = document.getElementById('categoryBalancesTable').getElementsByTagName('tbody')[0];
    categoryBalancesTableBody.innerHTML = '';  // Tablodaki önceki verileri temizle

    for (const [category, balance] of Object.entries(categoryBalances)) {
        const row = categoryBalancesTableBody.insertRow();
        const categoryCell = row.insertCell(0);
        const balanceCell = row.insertCell(1);

        categoryCell.textContent = category;
        balanceCell.textContent = balance.toFixed(2);
    }
}
