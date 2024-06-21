export function getKrediKartiFields() {
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

export function getKrediKartiValues() {
    return {
        cardLimit: document.getElementById('cardLimit').value,
        billingCycle: document.getElementById('billingCycle').value,
        billingDay: document.getElementById('billingDay') ? document.getElementById('billingDay').value : null,
        billingWorkDay: document.getElementById('billingWorkDay') ? document.getElementById('billingWorkDay').value : null
    };
}
