import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
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

// Hesap türlerine göre form alanlarını dinamik olarak oluşturmak için account_settings.json dosyasını yükle
let accountSettings = {};

fetch('account_settings.json')
    .then(response => response.json())
    .then(data => {
        accountSettings = data;
        setupAccountForm();
    })
    .catch(error => console.error('Account settings yükleme hatası: ', error));

function setupAccountForm() {
    const accountTypeSelect = document.getElementById('accountType');
    accountTypeSelect.addEventListener('change', handleAccountTypeChange);
}

function handleAccountTypeChange() {
    const accountType = document.getElementById('accountType').value;
    const formContainer = document.getElementById('dynamicFormFields');
    formContainer.innerHTML = ''; // Mevcut form alanlarını temizle

    if (accountSettings[accountType]) {
        accountSettings[accountType].forEach(fieldConfig => {
            const formField = createFormField(fieldConfig);
            formContainer.appendChild(formField);
        });
    }
}

function createFormField(fieldConfig) {
    const fieldWrapper = document.createElement('div');
    fieldWrapper.classList.add('form-group');

    const label = document.createElement('label');
    label.textContent = fieldConfig.label;
    fieldWrapper.appendChild(label);

    const input = document.createElement('input');
    input.setAttribute('type', fieldConfig.type);
    input.setAttribute('name', fieldConfig.name);
    input.classList.add('form-control');

    // Eğer step değeri varsa, input elementine ekleyelim
    if (fieldConfig.step) {
        input.setAttribute('step', fieldConfig.step);
    }

    fieldWrapper.appendChild(input);

    return fieldWrapper;
}

document.getElementById('accountForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const accountType = document.getElementById('accountType').value;
    const formData = new FormData(e.target);
    const accountData = Object.fromEntries(formData.entries());

    try {
        await addDoc(collection(db, 'accounts'), {
            ...accountData,
            accountType: accountType,
            userId: auth.currentUser.uid
        });
        alert('Hesap başarıyla oluşturuldu!');
        loadAccounts();
    } catch (error) {
        console.error('Hesap oluşturma hatası: ', error);
        alert('Hesap oluşturulurken bir hata oluştu: ' + error.message);
    }
});

async function loadAccounts() {
    const accountsList = document.getElementById('accountsList');
    accountsList.innerHTML = ''; // Mevcut hesapları temizle

    const querySnapshot = await getDocs(collection(db, 'accounts'));
    querySnapshot.forEach(doc => {
        const account = doc.data();
        const accountItem = document.createElement('div');
        accountItem.classList.add('account-item');
        accountItem.innerHTML = `
            <button class="accordion">${account.accountName}</button>
            <div class="panel">
                <p>Hesap Türü: ${account.accountType}</p>
                <p>Başlangıç Bakiyesi: ${account.initialBalance}</p>
                <p>Mevcut Bakiye: ${account.currentBalance}</p>
            </div>
        `;
        accountsList.appendChild(accountItem);
    });

    setupAccordion();
}

function setupAccordion() {
    const accordions = document.getElementsByClassName("accordion");
    for (let i = 0; i < accordions.length; i++) {
        accordions[i].addEventListener("click", function () {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    }
}

// Menü yükleme
window.onload = function () {
    loadMenu();
    loadAccounts();
};
