import { getNakitFields, getNakitValues } from './nakit.js';
import { getBankaFields, getBankaValues } from './banka.js';
import { getKrediFields, getKrediValues } from './kredi.js';
import { getKrediKartiFields, getKrediKartiValues } from './krediKarti.js';
import { getBirikimFields, getBirikimValues } from './birikim.js';

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
