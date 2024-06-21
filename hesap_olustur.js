import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";
import { auth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

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

async function loadAccounts() {
    const accountsContainer = document.getElementById('existingAccounts');
    accountsContainer.innerHTML = '';

    const querySnapshot = await getDocs(collection(db, 'accounts'));

    querySnapshot.forEach((doc) => {
        const accountData = doc.data();
        const accountDiv = document.createElement('div');
        accountDiv.className = 'account-item';
        accountDiv.innerHTML = `
            <span>${accountData.accountName} - ${accountData.accountType}</span>
            <div class="action-buttons">
                <button onclick="editAccount('${doc.id}', '${accountData.accountName}', '${accountData.accountType}')">Düzenle</button>
                <button onclick="deleteAccount('${doc.id}')">Sil</button>
            </div>
        `;
        accountsContainer.appendChild(accountDiv);
    });
}

async function addAccount(accountName, accountType) {
    try {
        await addDoc(collection(db, 'accounts'), {
            accountName,
            accountType
        });
        loadAccounts();
    } catch (error) {
        console.error('Hata:', error);
        alert('Hesap eklenirken bir hata oluştu.');
    }
}

async function deleteAccount(accountId) {
    await deleteDoc(doc(db, 'accounts', accountId));
    loadAccounts();
}

function editAccount(accountId, accountName, accountType) {
    const newAccountName = prompt('Yeni Hesap Adı:', accountName);
    const newAccountType = prompt('Yeni Hesap Türü:', accountType);
    if (newAccountName && newAccountType) {
        updateAccount(accountId, newAccountName, newAccountType);
    }
}

async function updateAccount(accountId, newAccountName, newAccountType) {
    const accountDoc = doc(db, 'accounts', accountId);
    await setDoc(accountDoc, { accountName: newAccountName, accountType: newAccountType }, { merge: true });
    loadAccounts();
}

document.getElementById('accountForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const accountName = document.getElementById('accountName').value;
    const accountType = document.getElementById('accountType').value;
    addAccount(accountName, accountType);
    document.getElementById('accountForm').reset();
});

loadAccounts();

// İşlevleri global hale getirin
window.deleteAccount = deleteAccount;
window.editAccount = editAccount;
