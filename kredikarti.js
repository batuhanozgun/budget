export function getKrediKartıFields() {
    return `
        <label for="cardLimit">Kart Limiti:</label>
        <input type="number" id="cardLimit" name="cardLimit" required>
        <label for="billingCycle">Hesap Kesim Dönemi:</label>
        <select id="billingCycle" name="billingCycle" required>
            <option value="specificDay">Her ayın belirli bir günü</option>
            <option value="workDay">Her ayın belirli bir iş günü</option>
        </select>
        <div id="billingCycleDetails"></div>`;
}

export function getKrediKartıValues() {
    return {
        cardLimit: document.getElementById('cardLimit').value,
        billingCycle: document.getElementById('billingCycle').value,
        billingDay: document.getElementById('billingDay') ? document.getElementById('billingDay').value : null,
        billingWorkDay: document.getElementById('billingWorkDay') ? document.getElementById('billingWorkDay').value : null
    };
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('billingCycle').addEventListener('change', updateBillingCycleDetails);
});

function updateBillingCycleDetails() {
    const billingCycle = document.getElementById('billingCycle').value;
    const billingCycleDetails = document.getElementById('billingCycleDetails');
    billingCycleDetails.innerHTML = '';

    if (billingCycle === 'specificDay') {
        billingCycleDetails.innerHTML += '<label for="billingDay">Gün:</label><input type="number" id="billingDay" name="billingDay" min="1" max="31" required>';
    } else if (billingCycle === 'workDay') {
        billingCycleDetails.innerHTML += '<label for="billingWorkDay">İş Günü:</label><select id="billingWorkDay" name="billingWorkDay" required><option value="first">Ayın ilk iş günü</option><option value="last">Ayın son iş günü</option></select>';
    }
}
