// Setup event listeners
function setupEventListeners() {
    // Button untuk membuka modal tambah transaksi
    document.getElementById('add-transaction-btn').addEventListener('click', () => {
        openModal('add');
    });

    // button untuk membuka modal edit transaksi
    document.getElementById('delete-all-btn').addEventListener('click', () => {
        showConfirmModal('Apakah Anda yakin ingin menghapus semua data transaksi?', deleteAllTransactions);
    });

    // button untuk menutup modal
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('confirm-no').addEventListener('click', closeConfirmModal);

    // button untuk submit form transaksi
    document.getElementById('transaction-form').addEventListener('submit', handleFormSubmit);

    // Confirm modal
    document.getElementById('confirm-yes').addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback();
        }
        closeConfirmModal();
    });

    // tutup modal ketika user klik di luar modal
    document.getElementById('transaction-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });

    document.getElementById('confirm-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeConfirmModal();
    });
}