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

// Menü yüklensin
loadMenu();

async function loadAccountSettings() {
    const response = await fetch('account_settings.json');
    const accountSettings = await response.json();
    return accountSettings;
}

function createFormFields(fields) {
    const formContainer = document.getElementById('formContainer');
    formContainer.innerHTML = ''; // Mevcut form alanlarını temizle
    fields.forEach(field => {
        const fieldElement = document.createElement('div');
        fieldElement.classList.add('form-group');
        let inputElement;
        if (field.type === 'checkbox') {
            inputElement = document.createElement('input');
            inputElement.type = 'checkbox';
        } else {
            inputElement = document.createElement('input');
            inputElement.type = field.type;
        }
        inputElement.id = field.name.replace(/ /g, '_');
        inputElement.name = field.name;
        inputElement.required = field.required;
        fieldElement.innerHTML = `<label for="${inputElement.id}">${field.name}</label>`;
        fieldElement.appendChild(inputElement);
        formContainer.appendChild(fieldElement);
    });
}

async function onAccountTypeChange(event) {
    const accountSettings = await loadAccountSettings();
    const selectedAccountType = event.target.value;
    const accountTypeInfo = accountSettings[selectedAccountType];
    document.getElementById('accountDescription').innerText = accountTypeInfo.description;
    createFormFields(accountTypeInfo.fields);
}

document.getElementById('accountType').addEventListener('change', onAccountTypeChange);

document.getElementById('createAccountForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const accountType = document.getElementById('accountType').value;
    const formData = new FormData(event.target);
    const accountData = {};
    formData.forEach((value, key) => {
        accountData[key] = value;
    });
    accountData['type'] = accountType;
    const userId = getAuth().currentUser.uid;
    accountData['userId'] = userId;

    await addDoc(collection(db, 'accounts'), accountData);
    alert('Hesap başarıyla oluşturuldu!');
    window.location.reload();
});

async function loadAccounts() {
    const userId = getAuth().currentUser.uid;
    const accountsSnapshot = await getDocs(collection(db, 'accounts'));
    const accountList = document.getElementById('accountList');
    accountList.innerHTML = '';
    accountsSnapshot.forEach((doc) => {
        const accountData = doc.data();
        if (accountData.userId === userId) {
            const accountItem = document.createElement('div');
            accountItem.classList.add('account-item');
            accountItem.innerHTML = `
                <strong>Hesap Adı:</strong> ${accountData['Hesap Adı']} - ${accountData.type}
                <div class="account-details">
                    <strong>Hesap Türü:</strong> ${accountData.type}<br>
                    <strong>Başlangıç Bakiyesi:</strong> ${accountData['Başlangıç Bakiyesi']}
                </div>
            `;
            accountItem.addEventListener('click', () => {
                const details = accountItem.querySelector('.account-details');
                details.style.display = details.style.display === 'none' ? 'block' : 'none';
            });
            accountList.appendChild(accountItem);
        }
    });
}

onAuthStateChanged(getAuth(), (user) => {
    if (user) {
        loadAccounts();
    } else {
        // Kullanıcı giriş yapmamışsa giriş sayfasına yönlendirin
        window.location.href = 'login.html';
    }
});

window.onload = function() {
    loadMenu();
};
