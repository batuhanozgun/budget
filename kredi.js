export function getKrediFields() {
    return `
        <label for="loanAmount">Kredi Tutarı:</label>
        <input type="number" step="0.01" id="loanAmount" name="loanAmount" required>
        <label for="fundRate">Fon Oranı (%):</label>
        <input type="number" step="0.01" id="fundRate" name="fundRate" required>
        <label for="taxRate">Vergi Oranı (%):</label>
        <input type="number" step="0.01" id="taxRate" name="taxRate" required>
        <label for="remainingTerm">Kalan Vade:</label>
        <input type="number" id="remainingTerm" name="remainingTerm" required>
        <label for="installmentAmount">Taksit Tutarı:</label>
        <input type="number" step="0.01" id="installmentAmount" name="installmentAmount" required>
        <label for="totalTerm">Toplam Vade:</label>
        <input type="number" id="totalTerm" name="totalTerm" required>
        <label for="loanInterestRate">Faiz Oranı (%):</label>
        <input type="number" step="0.01" id="loanInterestRate" name="loanInterestRate" required>
    `;
}

export function getKrediValues() {
    return {
        loanAmount: parseFloat(document.getElementById('loanAmount').value).toFixed(2),
        fundRate: parseFloat(document.getElementById('fundRate').value).toFixed(2),
        taxRate: parseFloat(document.getElementById('taxRate').value).toFixed(2),
        remainingTerm: parseInt(document.getElementById('remainingTerm').value),
        installmentAmount: parseFloat(document.getElementById('installmentAmount').value).toFixed(2),
        totalTerm: parseInt(document.getElementById('totalTerm').value),
        loanInterestRate: parseFloat(document.getElementById('loanInterestRate').value).toFixed(2)
    };
}
