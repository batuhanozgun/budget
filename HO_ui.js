import { addDoc, getDocs, query, where, doc, getDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { db } from './firebaseConfig.js';
import { getKrediKartiFields } from './krediKarti.js';

// Fonksiyon tanımlamaları ve diğer kodlar

export async function loadAccounts(user) {
    if (!user) {
        console.error('Kullanıcı oturumu açık değil.');
        window.location.href = 'login.html';
        return;
    }

    const q = query(collection(db, "accounts"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const accountListContainer = document.getElementById('accountListContainer');
    accountListContainer.innerHTML = '';

    const accountsByType = {};

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!accountsByType[data.accountType]) {
            accountsByType[data.accountType] = [];
        }
        accountsByType[data.accountType].push({ ...data, id: doc.id });
    });

    const accountTypeLabels = {
        'nakit': 'Nakit Hesapları',
        'banka': 'Banka Hesapları',
        'kredi': 'Kredi Hesapları',
        'krediKarti': 'Kredi Kartları',
        'birikim': 'Birikim Hesapları'
    };

    for (const [type, accounts] of Object.entries(accountsByType)) {
        const typeDiv = document.createElement('div');
        typeDiv.classList.add('account-type-group');

        const typeHeader = document.createElement('h3');
        typeHeader.textContent = accountTypeLabels[type] || type;
        typeDiv.appendChild(typeHeader);

        accounts.forEach(account => {
            const accountDiv = document.createElement('div');
            accountDiv.classList.add('account-item');
            accountDiv.textContent = account.accountName;
            accountDiv.addEventListener('click', async () => {
                const accountData = await loadAccountDetails(account.id);
                if (accountData) {
                    displayAccountDetails(accountData, account.id);
                }
            });
            typeDiv.appendChild(accountDiv);
        });

        accountListContainer.appendChild(typeDiv);
    }
}

export async function loadAccountDetails(accountId) {
    const accountDoc = await getDoc(doc(db, 'accounts', accountId));
    return accountDoc.exists() ? accountDoc.data() : null;
}

export function displayAccountDetails(accountData, accountId) {
    const accountInfo = document.getElementById('accountInfo');
    accountInfo.innerHTML = '';
    const labels = {
        cardLimit: 'Kart Limiti',
        availableLimit: 'Kullanılabilir Limit',
        currentSpending: 'Dönem İçi Harcama',
        pendingAmountAtOpening: 'Hesap Açılışındaki Bekleyen Tutar',
        previousStatementBalance: 'Bir Önceki Ekstreden Kalan Tutar',
        statementDate: 'En Yakın Ekstre Kesim Tarihi',
        paymentDueDate: 'En Yakın Son Ödeme Tarihi',
        installments: 'Gelecek Dönem Taksitler',
        currency: 'Para Birimi',
        accountType: 'Hesap Türü',
        accountName: 'Hesap Adı',
        openingDate: 'Açılış Tarihi',
        uid: 'Kullanıcı ID',
        loanAmount: 'Kredi Tutarı',
        loanInterestRate: 'Faiz Oranı',
        fundRate: 'Fon Oranı',
        taxRate: 'Vergi Oranı',
        totalTerm: 'Toplam Vade',
        remainingTerm: 'Kalan Vade',
        installmentAmount: 'Taksit Tutarı',
        initialBalance: 'Başlangıç Bakiyesi',
        overdraftLimit: 'KMH Limiti',
        overdraftInterestRate: 'KMH Faizi',
        targetAmount: 'Düzenli Ödenen Tutar',
        targetDate: 'En Yakın Ödeme Yapılacak Hedef Tarih'
    };

    for (const key in accountData) {
        if (accountData.hasOwnProperty(key)) {
            const p = document.createElement('p');
            p.textContent = `${labels[key] || key}: ${accountData[key]}`;
            accountInfo.appendChild(p);
        }
    }
    document.getElementById('accountDetails').style.display = 'block';
    document.getElementById('deleteAccountButton').dataset.accountId = accountId;
    document.getElementById('editAccountButton').dataset.accountId = accountId;
}

export function showMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

export function resetForm() {
    document.getElementById('accountForm').reset();
    document.getElementById('accountForm').dataset.mode = 'create';
    document.getElementById('accountForm').dataset.accountId = '';
    document.querySelector('.form-section h2').textContent = 'Hesap Oluştur';
    document.querySelector('.form-section button[type="submit"]').textContent = 'Hesap Oluştur';
}

export function updateDynamicFields() {
    const accountType = document.getElementById('accountType').value;
    const dynamicFields = document.getElementById('dynamicFields');
    const futureInstallmentsSection = document.getElementById('futureInstallmentsSection');
    dynamicFields.innerHTML = '';
    futureInstallmentsSection.style.display = 'none'; // Hide by default

    let fields = '';
    switch (accountType) {
        case 'nakit':
            fields = getNakitFields();
            break;
        case 'banka':
            fields = getBankaFields();
            break;
        case 'kredi':
            fields = getKrediFields();
            break;
        case 'krediKarti':
            fields = getKrediKartiFields();
            futureInstallmentsSection.style.display = 'block'; // Show future installments section
            break;
        case 'birikim':
            fields = getBirikimFields();
            break;
    }

    dynamicFields.innerHTML = fields;

    // Enable form fields after account type is selected
    document.getElementById('accountName').disabled = false;
    document.getElementById('openingDate').disabled = false;
    document.getElementById('currency').disabled = false;
    document.querySelector('button[type="submit"]').disabled = false;
}

// Function to add an installment
export function addInstallment() {
    const container = document.getElementById('installmentsContainer');
    const installmentDiv = document.createElement('div');
    installmentDiv.classList.add('installment');
    
    installmentDiv.innerHTML = `
        <label for="installmentMonth">Ay:</label>
        <input type="number" class="installmentMonth" name="installmentMonth" min="1" max="12" required>
        <label for="installmentYear">Yıl:</label>
        <input type="number" class="installmentYear" name="installmentYear" min="2023" required>
        <label for="installmentAmount">Tutar:</label>
        <input type="number" class="installmentAmount" name="installmentAmount" required>
        <button type="button" class="removeInstallmentButton">Kaldır</button>
    `;

    installmentDiv.querySelector('.removeInstallmentButton').addEventListener('click', () => {
        container.removeChild(installmentDiv);
    });

    container.appendChild(installmentDiv);
}

// Export functions
export { loadAccounts, loadAccountDetails, displayAccountDetails, showMessage, resetForm, updateDynamicFields, addInstallment };
