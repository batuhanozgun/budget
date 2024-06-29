import { auth, db } from './firebaseConfig.js';
import { collection, addDoc, getDocs, query, where, doc, getDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { checkAuth, getCurrentUser } from './auth.js';
import { getNakitFields, getNakitValues, getNakitLabels } from './nakit.js';
import { getBankaFields, getBankaValues, getBankaLabels } from './banka.js';
import { getKrediFields, getKrediValues, getKrediLabels } from './kredi.js';
import { getKrediKartiFields, getKrediKartiValues, getKrediKartiLabels, addInstallment, getInstallmentsData } from './krediKarti.js';
import { getBirikimFields, getBirikimValues, getBirikimLabels } from './birikim.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user) {
        loadAccounts(user);
    }

    document.getElementById('accountType').addEventListener('change', updateDynamicFields);
    document.getElementById('accountForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('addInstallmentButton').addEventListener('click', addInstallment);
    document.getElementById('deleteAccountButton').addEventListener('click', deleteAccount);
    document.getElementById('editAccountButton').addEventListener('click', editAccount);
    document.getElementById('cancelEditButton').addEventListener('click', resetForm);
});

async function loadAccounts(user) {
    if (!user) {
        console.error('Kullanıcı oturumu açık değil.');
        window.location.href = 'login.html'; // Kullanıcı oturum açmamışsa login sayfasına yönlendir
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

            const accountDetailsDiv = document.createElement('div');
            accountDetailsDiv.classList.add('account-details');
            accountDetailsDiv.style.display = 'none';
            accountDiv.appendChild(accountDetailsDiv);

            accountDiv.addEventListener('click', async () => {
                const accountData = await loadAccountDetails(account.id);
                if (accountData) {
                    displayAccountDetails(accountData, accountDetailsDiv);
                    accountDetailsDiv.style.display = accountDetailsDiv.style.display === 'none' ? 'block' : 'none';
                }
            });

            typeDiv.appendChild(accountDiv);
        });

        accountListContainer.appendChild(typeDiv);
    }
}

async function loadAccountDetails(accountId) {
    const accountDoc = await getDoc(doc(db, 'accounts', accountId));
    return accountDoc.exists() ? accountDoc.data() : null;
}

function displayAccountDetails(accountData, accountDetailsDiv) {
    accountDetailsDiv.innerHTML = '';
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

    const orderedKeys = [
        'accountName', 'accountType', 'openingDate', 'currency', 
        'cardLimit', 'availableLimit', 'currentSpending', 'pendingAmountAtOpening', 
        'previousStatementBalance', 'statementDate', 'paymentDueDate', 'installments',
        'loanAmount', 'loanInterestRate', 'fundRate', 'taxRate', 'totalTerm', 'remainingTerm', 'installmentAmount',
        'initialBalance', 'overdraftLimit', 'overdraftInterestRate',
        'targetAmount', 'targetDate', 'uid'
    ];

    orderedKeys.forEach(key => {
        if (accountData[key] !== undefined) {
            const p = document.createElement('p');
            p.textContent = `${labels[key] || key}: ${accountData[key]}`;
            accountDetailsDiv.appendChild(p);
        }
    });
}

async function deleteAccount() {
    const accountId = this.dataset.accountId;
    if (!accountId) return;

    try {
        await deleteDoc(doc(db, 'accounts', accountId));
        console.log('Hesap başarıyla silindi.');
        document.getElementById('accountDetails').style.display = 'none';
        const user = await checkAuth();
        if (user) {
            loadAccounts(user);
        }
        showMessage('Hesap başarıyla silindi.');
        resetForm();
    } catch (e) {
        console.error('Hesap silinirken hata oluştu:', e);
        showMessage('Hesap silinirken hata oluştu.');
    }
}

async function editAccount() {
    const accountId = this.dataset.accountId;
    if (!accountId) return;

    const accountData = await loadAccountDetails(accountId);
    if (!accountData) return;

    document.getElementById('accountName').value = accountData.accountName;
    document.getElementById('accountType').value = accountData.accountType;
    document.getElementById('openingDate').value = accountData.openingDate;
    document.getElementById('currency').value = accountData.currency;

    // Load dynamic fields
    const accountType = accountData.accountType;
    updateDynamicFields();
    for (const key in accountData) {
        if (accountData.hasOwnProperty(key)) {
            const input = document.getElementById(key);
            if (input) {
                input.value = accountData[key];
            }
        }
    }

    // Show future installments if account type is credit card
    if (accountType === 'krediKarti') {
        const futureInstallmentsSection = document.getElementById('futureInstallmentsSection');
        futureInstallmentsSection.style.display = 'block';
        const installmentsContainer = document.getElementById('installmentsContainer');
        installmentsContainer.innerHTML = '';
        const installments = accountData.installments || [];
        installments.forEach(installment => {
            addInstallment();
            const lastInstallment = installmentsContainer.lastElementChild;
            lastInstallment.querySelector('.installmentMonth').value = installment.month;
            lastInstallment.querySelector('.installmentYear').value = installment.year;
            lastInstallment.querySelector('.installmentAmount').value = installment.amount;
        });
    }

    // Form submit eventini güncelleme için ayarla
    document.getElementById('accountForm').dataset.mode = 'edit';
    document.getElementById('accountForm').dataset.accountId = accountId;
    document.querySelector('.form-section h2').textContent = 'Hesabı Düzenle';
    document.querySelector('.form-section button[type="submit"]').textContent = 'Güncelle';
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const formMode = document.getElementById('accountForm').dataset.mode;
    const accountData = getFormData();

    if (formMode === 'edit') {
        const accountId = document.getElementById('accountForm').dataset.accountId;
        try {
            await updateDoc(doc(db, 'accounts', accountId), accountData);
            console.log('Hesap başarıyla güncellendi.');
            document.getElementById('accountForm').dataset.mode = 'create';
            document.getElementById('accountForm').dataset.accountId = '';
            const user = await checkAuth();
            if (user) {
                loadAccounts(user);
            }
            showMessage('Hesap başarıyla güncellendi.');
            resetForm();
        } catch (e) {
            console.error('Hesap güncellenirken hata oluştu:', e);
            showMessage('Hesap güncellenirken hata oluştu.');
        }
    } else {
        try {
            const user = await checkAuth();
            if (!user) {
                return;
            }

            const docRef = await addDoc(collection(db, "accounts"), {
                uid: user.uid,
                ...accountData
            });
            console.log("Document written with ID: ", docRef.id);
            loadAccounts(user);
            showMessage('Hesap başarıyla oluşturuldu.');
            resetForm();
        } catch (e) {
            console.error("Error adding document: ", e);
            showMessage('Hesap oluşturulurken hata oluştu.');
        }
    }
}

function updateDynamicFields() {
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

function getFormData() {
    const accountName = document.getElementById('accountName').value;
    const openingDate = document.getElementById('openingDate').value;
    const currency = document.getElementById('currency').value;
    const accountType = document.getElementById('accountType').value;

    let dynamicFields = {};
    switch (accountType) {
        case 'nakit':
            dynamicFields = getNakitValues();
            break;
        case 'banka':
            dynamicFields = getBankaValues();
            break;
        case 'kredi':
            dynamicFields = getKrediValues();
            break;
        case 'krediKarti':
            dynamicFields = getKrediKartiValues();
            break;
        case 'birikim':
            dynamicFields = getBirikimValues();
            break;
    }

    return {
        accountName,
        openingDate,
        currency,
        accountType,
        ...dynamicFields
    };
}

function showMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

function resetForm() {
    document.getElementById('accountForm').reset();
    document.getElementById('accountForm').dataset.mode = 'create';
    document.getElementById('accountForm').dataset.accountId = '';
    document.querySelector('.form-section h2').textContent = 'Hesap Oluştur';
    document.querySelector('.form-section button[type="submit"]').textContent = 'Hesap Oluştur';
}

// İşlevleri global hale getirin
window.loadAccounts = loadAccounts;
window.displayAccountDetails = displayAccountDetails;
window.updateDynamicFields = updateDynamicFields;
window.getFormData = getFormData;
window.addInstallment = addInstallment;
window.deleteAccount = deleteAccount;
window.editAccount = editAccount;
window.resetForm = resetForm;
