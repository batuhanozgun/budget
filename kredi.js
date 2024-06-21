export function getKrediFields() {
    return `
        <label for="loanAmount">Kredi Tutarı:</label>
        <input type="number" step="0.01" id="loanAmount" name="loanAmount" required>
        <label for="disbursedAmount">Hesaba Yatan Tutar:</label>
        <input type="number" step="0.01" id="disbursedAmount" name="disbursedAmount" required>
        <label for="expenses">Masraflar:</label>
        <input type="number" step="0.01" id="expenses" name="expenses" required>
        <label for="insurance">Sigorta:</label>
        <input type="number" step="0.01" id="insurance" name="insurance" required>
        <label for="installments">Vade:</label>
        <input type="number" id="installments" name="installments" required>
    `;
}

export function getKrediValues() {
    return {
        loanAmount: parseFloat(document.getElementById('loanAmount').value).toFixed(2),
        disbursedAmount: parseFloat(document.getElementById('disbursedAmount').value).toFixed(2),
        expenses: parseFloat(document.getElementById('expenses').value).toFixed(2),
        insurance: parseFloat(document.getElementById('insurance').value).toFixed(2),
        installments: parseInt(document.getElementById('installments').value)
    };
}
