export function getKrediKartiFields() {
    return `
        <label for="cardLimit">Kart Limiti:</label>
        <input type="number" step="0.01" id="cardLimit" name="cardLimit" required>
        <label for="billingCycle">Hesap Kesim Dönemi:</label>
        <select id="billingCycle" name="billingCycle" required>
            <option value="specificDay">Her ayın belirli bir günü</option>
            <option value="workDay">Her ayın belirli bir iş günü</option>
        </select>
        <div id="billingCycleDetails"></div>
    `;
}

export function getKrediKartiValues() {
    return {
        cardLimit: parseFloat(document.getElementById('cardLimit').value).toFixed(2),
        billingCycle: document.getElementById('billingCycle').value,
        billingCycleDetails: getBillingCycleDetails()
    };
}

function getBillingCycleDetails() {
    const billingCycle = document.getElementById('billingCycle').value;
    let details = '';
    if (billingCycle === 'specificDay') {
        details = document.getElementById('billingDay').value;
    } else if (billingCycle === 'workDay') {
        details = document.getElementById('billingWorkDay').value;
    }
    return details;
}
