export function resetForm() {
    document.getElementById('accountForm').reset();
    document.getElementById('accountForm').dataset.mode = 'create';
    document.getElementById('accountForm').dataset.accountId = '';
    document.querySelector('.form-section h2').textContent = 'Hesap Oluştur';
    document.querySelector('.form-section button[type="submit"]').textContent = 'Hesap Oluştur';
}

export function showMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

export function loadAccountDetails(accountId) {
    return getDoc(doc(db, 'accounts', accountId));
}

export function displayAccountDetails(accountData, accountDiv) {
    const accountDetailsDiv = document.createElement('div');
    accountDetailsDiv.id = 'accountDetails';
    accountDetailsDiv.classList.add('account-details');

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
        'initialBalance', 'overdraftLimit', 'overdraftInterestRate', 
        'cardLimit', 'availableLimit', 'currentSpending', 
        'pendingAmountAtOpening', 'previousStatementBalance', 'statementDate',
        'paymentDueDate', 'installments', 'loanAmount', 'loanInterestRate',
        'fundRate', 'taxRate', 'totalTerm', 'remainingTerm', 'installmentAmount',
        'targetAmount', 'targetDate', 'uid'
    ];

    orderedKeys.forEach(key => {
        if (accountData.hasOwnProperty(key)) {
            const p = document.createElement('p');
            p.textContent = `${labels[key] || key}: ${accountData[key]}`;
            accountDetailsDiv.appendChild(p);
        }
    });

    accountDiv.insertAdjacentElement('afterend', accountDetailsDiv);

    document.getElementById('deleteAccountButton').dataset.accountId = accountData.id;
    document.getElementById('editAccountButton').dataset.accountId = accountData.id;
}

export { loadAccountDetails, displayAccountDetails };
