export function getBankaFields() {
    return `
        <label for="initialBalance">Başlangıç Bakiyesi:</label>
        <input type="number" id="initialBalance" name="initialBalance" step="0.01" required>
        <label for="overdraftLimit">KMH Limiti:</label>
        <input type="number" id="overdraftLimit" name="overdraftLimit" step="0.01" required>
        <label for="overdraftInterestRate">KMH Faizi (%):</label>
        <input type="number" step="0.01" id="overdraftInterestRate" name="overdraftInterestRate" required>
    `;
}

export function getBankaValues() {
    return {
        initialBalance: parseFloat(document.getElementById('initialBalance').value).toFixed(2),
        overdraftLimit: parseFloat(document.getElementById('overdraftLimit').value).toFixed(2),
        overdraftInterestRate: parseFloat(document.getElementById('overdraftInterestRate').value).toFixed(2)
    };
}
