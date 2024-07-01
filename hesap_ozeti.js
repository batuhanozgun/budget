import { db } from './firebaseConfig.js';
import { getDocs, collection, doc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { checkAuth } from './auth.js';
import { Timestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    showLoadingOverlay();
    const user = await checkAuth();
    if (user) {
        const transactions = await getTransactions(user.uid);
        console.log(transactions);  // Verileri kontrol etmek için konsola yazdır
        await displayTransactions(transactions);
    }
    hideLoadingOverlay();
});

async function getTransactions(uid) {
    const transactionsSnapshot = await getDocs(query(collection(db, 'transactions'), where("userId", "==", uid)));
    const transactions = [];
    for (const doc of transactionsSnapshot.docs) {
        const data = doc.data();

        // Hesap bilgisini çekmek için accounts tablosunu kontrol et
        const accountDoc = await getDoc(doc(db, `accounts/${data.kaynakHesap}`));
        const accountData = accountDoc.exists() ? accountDoc.data() : null;

        // Eğer hesap kredi kartı hesabıysa ve taksit adedi 1'den fazlaysa, taksit verilerini çek
        if (accountData && accountData.kayitTipi === 'krediKarti' && data.taksitAdedi > 1) {
            const installmentsSnapshot = await getDocs(collection(db, `transactions/${doc.id}/creditcardInstallments`));
            for (const installmentDoc of installmentsSnapshot.docs) {
                const installmentData = installmentDoc.data();
                transactions.push({
                    ...data,
                    taksitTarihi: installmentData.taksitTarihi,
                    tutar: installmentData.tutar
                });
            }
        } else {
            transactions.push(data);
        }
    }
    return transactions;
}

function getDateFromTimestamp(timestamp) {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    return new Date(timestamp);
}

async function displayTransactions(transactions) {
    const summaryTableHead = document.getElementById('accountBalancesTable').getElementsByTagName('thead')[0];
    const summaryTableBody = document.getElementById('accountBalancesTable').getElementsByTagName('tbody')[0];

    // Add headers to table head
    const headerRow = summaryTableHead.rows[0];
    const islemDateTh = document.createElement('th');
    islemDateTh.textContent = "İşlem Tarihi";
    headerRow.appendChild(islemDateTh);
    const taksitDateTh = document.createElement('th');
    taksitDateTh.textContent = "Taksit Tarihi";
    headerRow.appendChild(taksitDateTh);
    const amountTh = document.createElement('th');
    amountTh.textContent = "Tutar";
    headerRow.appendChild(amountTh);
    const accountTh = document.createElement('th');
    accountTh.textContent = "Hesap";
    headerRow.appendChild(accountTh);
    const typeTh = document.createElement('th');
    typeTh.textContent = "Kayıt Tipi";
    headerRow.appendChild(typeTh);

    // Add transactions to table body
    for (const transaction of transactions) {
        const row = summaryTableBody.insertRow();
        const islemDateCell = row.insertCell(0);
        const taksitDateCell = row.insertCell(1);
        const amountCell = row.insertCell(2);
        const accountCell = row.insertCell(3);
        const typeCell = row.insertCell(4);

        const islemDate = getDateFromTimestamp(transaction.islemTarihi);
        const taksitDate = transaction.taksitTarihi ? getDateFromTimestamp(transaction.taksitTarihi) : null;

        islemDateCell.textContent = `${islemDate.getFullYear()}-${String(islemDate.getMonth() + 1).padStart(2, '0')}`;
        taksitDateCell.textContent = taksitDate ? `${taksitDate.getFullYear()}-${String(taksitDate.getMonth() + 1).padStart(2, '0')}` : 'N/A';
        amountCell.textContent = formatNumber(transaction.tutar);
        accountCell.textContent = transaction.kaynakHesap;
        typeCell.textContent = transaction.kayitTipi;
    }
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function showLoadingOverlay() {
    document.querySelector('.loading-overlay').style.display = 'flex';
}

function hideLoadingOverlay() {
    document.querySelector('.loading-overlay').style.display = 'none';
}
