export function getBankaFields() {
    return `
        <label for="initialBalance">Başlangıç Bakiyesi:</label>
        <input type="number" id="initialBalance" name="initialBalance" required>
        <label for="overdraftLimit">KMH Limiti:</label>
        <input type="number" id="overdraftLimit" name="overdraftLimit" required>
        <label for="overdraftInterestRate">KMH Faizi (%):</label>
        <input type="number" step="0.01" id="overdraftInterestRate" name="overdraftInterestRate" required>
    `;
}

export function getBankaValues() {
    return {
        initialBalance: document.getElementById('initialBalance').value,
        overdraftLimit: document.getElementById('overdraftLimit').value,
        overdraftInterestRate: document.getElementById('overdraftInterestRate').value
    };
}
