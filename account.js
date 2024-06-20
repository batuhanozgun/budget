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

function formatNumber(input) {
    // 1. Remove thousands separators (periods in this case)
    let value = input.value.replace(/\./g, ''); 

    // 2. Replace comma (decimal separator) with a period
    value = value.replace(/,/g, '.'); 

    // 3. Parse the number
    let number = parseFloat(value);

    // 4. Format the number for display (using Turkish locale)
    if (!isNaN(number)) {
        input.value = number.toLocaleString('tr-TR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    } else {
        // Handle invalid input (optional)
        input.value = ''; 
        alert('Please enter a valid number.');
    }
}

function createFormFields(fields) {
    const formContainer = document.getElementById('formFields');
    formContainer.innerHTML = '';
    fields.forEach(field => {
        const label = document.createElement('label');
        label.innerText = field.label;
        let input;
        if (field.type === 'checkbox') {
            input = document.createElement('input');
            input.type = field.type;
            input.name = field.name;
            input.id = field.name;
            input.addEventListener('change', (e) => {
                const toggleField = formContainer.querySelector(`[name="${field.name.replace('Limiti', 'Tutarı')}"]`);
                if (e.target.checked) {
                    toggleField.style.display = 'block';
                } else {
                    toggleField.style.display = 'none';
                }
            });
        } else {
            input = document.createElement('input');
            input.type = field.type;
            input.name = field.name;
            if (field.type === 'number') {
                input.step = 'any';
                input.addEventListener('blur', () => formatNumber(input));
                input.addEventListener('focus', () => {
                    input.value = input.value.replace(/\./g, '').replace(/,/g, '.');
                });
            }
        }
        formContainer.appendChild(label);
        formContainer.appendChild(input);
        if (field.type === 'number' && field.name.includes('Tutarı')) {
            input.style.display = 'none';
        }
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
                    <div class="account-header">
                        <p><strong>Hesap Adı:</strong> ${accountData['Hesap Adı']}</p>
                        <p><strong>Hesap Türü:</strong> ${accountData['type']}</p>
                    </div>
                    <div class="account-details">
                        ${Object.keys(accountData).map(key => `
                            <p><strong>${key}:</strong> ${accountData[key]}</p>`).join('')}
                    </div>
                `;
                accountDiv.querySelector('.account-header').addEventListener('click', () => {
                    const details = accountDiv.querySelector('.account-details');
                    details.style.display = details.style.display === 'none' ? 'block' : 'none';
                });
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
        accountData[field.name] = field.value.replace(/\./g, '').replace(/,/g, '.'); // Veritabanına kaydedilmeden önce sayısal veriyi normalize etme
    });
    accountData['type'] = accountType;
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
