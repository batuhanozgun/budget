export function getBankaFields() {
    return `
        <label for="initialBalance">Başlangıç Bakiyesi:</label>
        <input type="text" id="initialBalance" name="initialBalance" required>
        <label for="overdraftLimit">KMH Limiti:</label>
        <input type="text" id="overdraftLimit" name="overdraftLimit" required>
        <label for="overdraftInterestRate">KMH Faizi (%):</label>
        <input type="number" step="0.01" id="overdraftInterestRate" name="overdraftInterestRate" required>
    `;
}

export function getBankaValues() {
    return {
        initialBalance: parseFormattedNumber(document.getElementById('initialBalance').value),
        overdraftLimit: parseFormattedNumber(document.getElementById('overdraftLimit').value),
        overdraftInterestRate: parseFloat(document.getElementById('overdraftInterestRate').value).toFixed(2)
    };
}

function formatNumberInput(event) {
    const value = event.target.value.replace(/,/g, '').replace(/\./g, '');
    if (!isNaN(value) && value !== '') {
        const formattedValue = parseFloat(value).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        event.target.value = formattedValue;
    }
}

function parseFormattedNumber(value) {
    return parseFloat(value.replace(/\./g, '').replace(/,/g, '.'));
}

// Add event listeners for input formatting
document.addEventListener('DOMContentLoaded', () => {
    const initialBalanceInput = document.getElementById('initialBalance');
    const overdraftLimitInput = document.getElementById('overdraftLimit');

    if (initialBalanceInput) {
        initialBalanceInput.addEventListener('input', formatNumberInput);
    }

    if (overdraftLimitInput) {
        overdraftLimitInput.addEventListener('input', formatNumberInput);
    }
});
