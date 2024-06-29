import { checkDuplicateAccountName, addAccount, updateAccount, deleteAccountById, loadAccounts, loadAccountDetails } from './HO_account.js';
import { resetForm, showMessage } from './HO_ui.js';
import { checkAuth } from './auth.js';

export async function handleFormSubmit(e) {
    e.preventDefault();

    const formMode = document.getElementById('accountForm').dataset.mode;
    const accountData = getFormData();

    if (formMode === 'edit') {
        const accountId = document.getElementById('accountForm').dataset.accountId;
        try {
            await updateAccount(accountId, accountData);
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

            const duplicate = await checkDuplicateAccountName(user.uid, accountData.accountName);
            if (duplicate) {
                showMessage('Bu isimde bir hesap zaten mevcut.');
                return;
            }

            const docRef = await addAccount(user, accountData);
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

export async function handleDeleteAccount() {
    const accountId = this.dataset.accountId;
    if (!accountId) return;

    try {
        await deleteAccountById(accountId);
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

export async function handleEditAccount() {
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
