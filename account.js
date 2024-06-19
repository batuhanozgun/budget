import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase konfigürasyonu
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
