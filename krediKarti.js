export function getKrediKartiFields() {
    return `
        <label for="cardLimit">Kart Limiti:</label>
        <input type="number" step="0.01" id="cardLimit" name="cardLimit" required>
        <label for="availableLimit">Kullanılabilir Limit (Kalan Limit):</label>
        <input type="number" step="0.01" id="availableLimit" name="availableLimit" required>
        <label for="currentSpending">Dönem İçi Harcama:</label>
        <input type="number" step="0.01" id="currentSpending" name="currentSpending" required>
        <label for="pendingAmountAtOpening">Hesap Açılışındaki Bekleyen Tutar:</label>
        <input type="number" step="0.01" id="pendingAmountAtOpening" name="pendingAmountAtOpening" required>
        <label for="previousStatementBalance">Bir Önceki Ekstreden Kalan Tutar:</label>
        <input type="number" step="0.01" id="previousStatementBalance" name="previousStatementBalance" required>
        <label for="statementDate">Ekstre Kesim Tarihi:</label>
        <input type="date" id="statementDate" name="statementDate" required>
        <label for="paymentDueDate">Son Ödeme Tarihi:</label>
        <input type="date" id="paymentDueDate" name="paymentDueDate" required>
    `;
}

export function getKrediKartiValues() {
    return {
        cardLimit: parseFloat(document.getElementById('cardLimit').value).toFixed(2),
        availableLimit: parseFloat(document.getElementById('availableLimit').value).toFixed(2),
        currentSpending: parseFloat(document.getElementById('currentSpending').value).toFixed(2),
        pendingAmountAtOpening: parseFloat(document.getElementById('pendingAmountAtOpening').value).toFixed(2),
        previousStatementBalance: parseFloat(document.getElementById('previousStatementBalance').value).toFixed(2),
        statementDate: document.getElementById('statementDate').value,
        paymentDueDate: document.getElementById('paymentDueDate').value
    };
}
