import { auth, db } from './firebaseConfig.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { checkAuth } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user) {
        loadTransactions(user);
    }
});

async function loadTransactions(user) {
    const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const tableBody = document.getElementById('transactionsTableBody');
    tableBody.innerHTML = '';

    querySnapshot.forEach((doc) => {
        const transaction = doc.data();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.kategori}</td>
            <td>${transaction.tutar}</td>
            <td>${transaction.kayitTipi}</td>
        `;
        tableBody.appendChild(row);
    });
}

document.getElementById('searchInput').addEventListener('input', filterTransactions);

function filterTransactions() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#transactionsTableBody tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const match = Array.from(cells).some(cell => cell.textContent.toLowerCase().includes(searchInput));
        if (match) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
