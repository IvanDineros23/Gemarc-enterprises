document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('uploadForm');
    const input = document.getElementById('certificateFile');
    const fileLabel = document.getElementById('selectedFileName');
    const overlay = document.getElementById('uploadOverlay');
    const submitButton = document.getElementById('uploadButton');

    if (input && fileLabel) {
        input.addEventListener('change', () => {
            fileLabel.textContent = input.files && input.files.length > 0 ? input.files[0].name : 'No file chosen yet.';
        });
    }

    if (form) {
        form.addEventListener('submit', (event) => {
            if (!input || !input.files || input.files.length === 0) {
                event.preventDefault();
                alert('Please choose an Excel file before uploading.');
                return;
            }

            const confirmed = window.confirm(
                'This will replace the current JSON index with the uploaded Excel file. Continue?'
            );

            if (!confirmed) {
                event.preventDefault();
                return;
            }

            if (overlay) {
                overlay.style.display = 'flex';
                overlay.setAttribute('aria-hidden', 'false');
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading';
            }
        });
    }
});
