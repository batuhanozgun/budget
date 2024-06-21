export function getKrediFields() {
    return `
        <label for="creditAmount">Kredi Tutarı:</label>
        <input type="number" id="creditAmount" name="creditAmount" required>
        <label for="creditedAmount">Hesaba Yatan Tutar:</label>
        <input type="number" id="creditedAmount" name="creditedAmount" required>
        <label for="expenses">Masraflar:</label>
        <input type="number" id="expenses" name="expenses" required>
        <label for="insurance">Sigorta:</label>
        <input type="number" id="insurance" name="insurance" required>
        <label for="term">Vade:</label>
        <input type="number" id="term" name="term" required>`;
}

export function getKrediValues() {
    return {
        creditAmount: document.getElementById('creditAmount').value,
        creditedAmount: document.getElementById('creditedAmount').value,
        expenses: document.getElementById('expenses').value,
        insurance: document.getElementById('insurance').value,
        term: document.getElementById('term').value
    };
}
