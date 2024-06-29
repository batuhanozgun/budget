import { auth, db } from './firebaseConfig.js';
import { checkAuth } from './auth.js';
import { loadAccounts, loadAccountDetails, displayAccountDetails } from './HO_account.js';
import { handleFormSubmit, handleDeleteAccount, resetForm } from './HO_formHandlers.js';
import { updateDynamicFields, showMessage, addInstallment } from './HO_ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user) {
        loadAccounts(user);
    }

    document.getElementById('accountType').addEventListener('change', updateDynamicFields);
    document.getElementById('accountForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('addInstallmentButton').addEventListener('click', addInstallment);
    document.getElementById('deleteAccountButton').addEventListener('click', handleDeleteAccount);
    document.getElementById('editAccountButton').addEventListener('click', handleEditAccount);
    document.getElementById('cancelEditButton').addEventListener('click', resetForm);
});
