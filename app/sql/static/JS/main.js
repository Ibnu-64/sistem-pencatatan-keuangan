// Global variabel
let financialChart;
let currentEditId = null;
let confirmCallback = null;

// Inisialisasi App
document.addEventListener("DOMContentLoaded", function () { 
    initializeChart();
    loadTransactions();
    loadTransactionsMonthly();
    loadSummary();
    setupEventListeners();

    document.getElementById("date").valueAsDate = new Date();
});
