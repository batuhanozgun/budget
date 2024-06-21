export function getBankaFields() {
    return `
        <label for="initialBalance">Başlangıç Bakiyesi:</label>
        <input type="number" id="initialBalance" name="initialBalance" required>
        <label for="overdraftLimit">KMH Limiti:</label>
        <input type="number" id="overdraftLimit" name="overdraftLimit" required>`;
}

export function getBankaValues() {
    return {
        initialBalance: document.getElementById('initialBalance').value,
        overdraftLimit: document.getElementById('overdraftLimit').value
    };
}
