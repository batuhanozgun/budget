import { checkAuth } from './auth.js';
import { getFormData, resetForm, showMessage } from './HO_ui.js';
import { loadAccounts, addAccount, updateAccount, deleteAccountById } from './HO_account.js';

export async function handleFormSubmit(e) {
    e.preventDefault();

    const formMode = document.getElementById('accountForm').dataset.mode;
    const accountData = getFormData();
    const user = await checkAuth();

    if (!user) {
        console.error('Kullanıcı oturumu açık değil.');
        window.location.href = 'login.html';
        return;
    }

    try {
        if (formMode === 'edit') {
            const accountId = document.getElementById('accountForm').dataset.accountId;
            await updateAccount(accountId, accountData);
            showMessage('Hesap başarıyla güncellendi.');
        } else {
            await addAccount(user.uid, accountData);
            showMessage('Hesap başarıyla oluşturuldu.');
        }
        loadAccounts(user);
        resetForm();
    } catch (e) {
        console.error('Hata oluştu:', e);
        showMessage('İşlem sırasında bir hata oluştu.');
    }
}

export function handleDeleteAccount() {
    const accountId = this.dataset.accountId;
    if (!accountId) return;

    if (confirm('Bu hesabı silmek istediğinize emin misiniz?')) {
        deleteAccountById(accountId).then(() => {
            showMessage('Hesap başarıyla silindi.');
            resetForm();
            checkAuth().then(user => {
                if (user) {
                    loadAccounts(user);
                }
            });
        }).catch(e => {
            console.error('Hesap silinirken hata oluştu:', e);
            showMessage('Hesap silinirken hata oluştu.');
        });
    }
}

export function handleEditAccount() {
    const accountId = this.dataset.accountId;
    if (!accountId) return;

    loadAccountDetails(accountId).then(accountData => {
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
    });
}

export function resetForm() {
    document.getElementById('accountForm').reset();
    document.getElementById('accountForm').dataset.mode = 'create';
    document.getElementById('accountForm').dataset.accountId = '';
    document.querySelector('.form-section h2').textContent = 'Hesap Oluştur';
    document.querySelector('.form-section button[type="submit"]').textContent = 'Hesap Oluştur';
}
