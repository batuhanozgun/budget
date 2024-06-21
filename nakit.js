export function getNakitFields() {
    return `
        <label for="initialBalance">Başlangıç Bakiyesi:</label>
        <input type="number" step="0.01" id="initialBalance" name="initialBalance" required>
    `;
}

export function getNakitValues() {
    return {
        initialBalance: document.getElementById('initialBalance').value
    };
}

export function getNakitLabels() {
    return {
        initialBalance: "Başlangıç Bakiyesi"
    };
}
