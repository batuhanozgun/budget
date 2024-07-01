function displayAccountDetails(accountData, accountId, accountDiv) {
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
        accountTypeName: 'Hesap Türü',
        accountName: 'Hesap Adı',
        openingDate: 'Açılış Tarihi',
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

    const accountInfo = document.createElement('div');
    accountInfo.classList.add('account-info');
    for (const key in accountData) {
        if (accountData.hasOwnProperty(key) && key !== 'installments' && key !== 'uid' && key !== 'accountType') {
            const p = document.createElement('p');
            p.textContent = `${labels[key] || key}: ${accountData[key]}`;
            accountInfo.appendChild(p);
        }
    }

    if (accountData.installments && Array.isArray(accountData.installments)) {
        const installmentsHeader = document.createElement('h4');
        installmentsHeader.textContent = labels.installments;
        accountInfo.appendChild(installmentsHeader);

        const installmentsList = document.createElement('ul');
        accountData.installments.forEach(installment => {
            const installmentItem = document.createElement('li');
            installmentItem.textContent = `Tutar: ${installment.amount}, Ay: ${installment.month}, Yıl: ${installment.year}`;
            installmentsList.appendChild(installmentItem);
        });
        accountInfo.appendChild(installmentsList);
    }

    const accountDetailsDiv = document.createElement('div');
    accountDetailsDiv.classList.add('account-details');
    accountDetailsDiv.appendChild(accountInfo);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.id = 'deleteAccountButton';
    deleteButton.textContent = 'Hesabı Sil';
    deleteButton.addEventListener('click', deleteAccount);
    accountDetailsDiv.appendChild(deleteButton);

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.id = 'editAccountButton';
    editButton.textContent = 'Hesabı Düzenle';
    editButton.addEventListener('click', editAccount);
    accountDetailsDiv.appendChild(editButton);

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.id = 'cancelEditButton';
    cancelButton.textContent = 'Vazgeç';
    cancelButton.addEventListener('click', resetForm);
    accountDetailsDiv.appendChild(cancelButton);

    accountDiv.appendChild(accountDetailsDiv);
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
        if (accountData.hasOwnProperty(key) && key !== 'uid' && key !== 'accountType') {
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
