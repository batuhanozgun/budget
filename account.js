import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { loadMenu } from './menu.js';

// Firebase konfigürasyonu
const firebaseConfig = {
    apiKey: "AIzaSyDidWK1ghqKTzokhT-YoqGb7Tz9w5AFjhM",
    authDomain: "batusbudget.firebaseapp.com",
    projectId: "batusbudget",
    storageBucket: "batusbudget.appspot.com",
    messagingSenderId: "1084998760222",
    appId: "1:1084998760222:web:d28492021d0ccefaf2bb0f"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchAccountSettings() {
    const response = await fetch('account_settings.json');
    return await response.json();
}

async function onAccountTypeChange(event) {
    const accountSettings = await fetchAccountSettings();
    const selectedAccountType = event.target.value;
    const accountTypeInfo = accountSettings[selectedAccountType];
    document.getElementById('accountDescription').innerText = accountTypeInfo.description;
    createFormFields(accountTypeInfo.fields);
}

function createFormFields(fields) {
    const formContainer = document.getElementById('formFields');
    formContainer.innerHTML = '';
    fields.forEach(field => {
        const label = document.createElement('label');
        label.innerText = field.label;
        const input = document.createElement('input');
        input.type = field.type;
        input.name = field.name;
        formContainer.appendChild(label);
        formContainer.appendChild(input);
    });
}

document.getElementById('accountType').addEventListener('change', onAccountTypeChange);

async function fetchAccounts() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const querySnapshot = await getDocs(collection(db, 'accounts'));
            const accountsContainer = document.getElementById('accountsContainer');
            accountsContainer.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const accountData = doc.data();
                const accountDiv = document.createElement('div');
                accountDiv.className = 'account';
                accountDiv.innerHTML = `
                    <p><strong>Hesap Adı:</strong> ${accountData['Hesap Adı']}</p>
                    <p><strong>Hesap Türü:</strong> ${accountData['Hesap Türü']}</p>
                    <p><strong>Başlangıç Bakiyesi:</strong> ${accountData['Başlangıç Bakiyesi']}</p>
                `;
                accountsContainer.appendChild(accountDiv);
            });
        }
    });
}

window.addEventListener('load', () => {
    loadMenu();
    fetchAccounts();
});

document.getElementById('createAccountForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const accountType = document.getElementById('accountType').value;
    const formFields = document.getElementById('formFields').querySelectorAll('input');
    const accountData = {};
    formFields.forEach(field => {
        accountData[field.name] = field.value;
    });
    accountData['Hesap Türü'] = accountType;
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await addDoc(collection(db, 'accounts'), accountData);
            alert('Hesap başarıyla oluşturuldu!');
            fetchAccounts();
        } else {
            alert('Kullanıcı oturumu açılmadı.');
        }
    });
});
