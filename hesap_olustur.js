import { auth, db } from './firebaseConfig.js';
import { checkAuth } from './auth.js';
import { loadAccounts, loadAccountDetails, displayAccountDetails } from './HO_account.js';
import { handleFormSubmit, handleDeleteAccount, handleEditAccount } from './HO_formHandlers.js';
import { updateDynamicFields, resetForm } from './HO_ui.js';

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
