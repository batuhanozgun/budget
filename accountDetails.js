export async function loadAccountDetails(accountId) {
    try {
        const docRef = doc(db, "accounts", accountId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.error("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        return null;
    }
}

export function displayAccountDetails(accountData, accountType) {
    const accountDetails = document.getElementById('accountDetails');
    accountDetails.innerHTML = '';

    const labels = getLabelsForAccountType(accountType);

    for (const [key, value] of Object.entries(accountData)) {
        const label = labels[key] || key;
        accountDetails.innerHTML += `<p><strong>${label}:</strong> ${value}</p>`;
    }
}

function getLabelsForAccountType(accountType) {
    switch (accountType) {
        case 'nakit':
            return getNakitLabels();
        case 'banka':
            return getBankaLabels();
        case 'kredi':
            return getKrediLabels();
        case 'krediKarti':
            return getKrediKartiLabels();
        case 'birikim':
            return getBirikimLabels();
        default:
            return {};
    }
}
