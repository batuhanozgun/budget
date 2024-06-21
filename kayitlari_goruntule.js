import { auth, db } from './firebaseConfig.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { checkAuth } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user) {
        loadTransactions(user);
    }
});

async function loadTransactions(user) {
    const q = query(collection(db, "transactions"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const tableBody = document.getElementById('transactionsTableBody');
    tableBody.innerHTML = '';

    querySnapshot.forEach((doc) => {
        const transaction = doc.data();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.category}</td>
            <td>${transaction.amount}</td>
            <td>${transaction.type}</td>
            <td><button class="edit-btn" data-id="${doc.id}">Düzenle</button></td>
        `;
        tableBody.appendChild(row);
    });
}

document.getElementById('filterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = await checkAuth();
    if (user) {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const q = query(
            collection(db, "transactions"),
            where("uid", "==", user.uid),
            where("date", ">=", startDate),
            where("date", "<=", endDate)
        );
        const querySnapshot = await getDocs(q);
        const tableBody = document.getElementById('transactionsTableBody');
        tableBody.innerHTML = '';

        querySnapshot.forEach((doc) => {
            const transaction = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.date}</td>
                <td>${transaction.category}</td>
                <td>${transaction.amount}</td>
                <td>${transaction.type}</td>
                <td><button class="edit-btn" data-id="${doc.id}">Düzenle</button></td>
            `;
            tableBody.appendChild(row);
        });
    }
});

document.addEventListener('click', function(e) {
    if (e.target && e.target.className === 'edit-btn') {
        const transactionId = e.target.getAttribute('data-id');
        // Düzenleme işlemleri burada yapılacak
        console.log(`Edit transaction with ID: ${transactionId}`);
    }
});
