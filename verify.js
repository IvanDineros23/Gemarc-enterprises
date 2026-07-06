const CERTIFICATE_JSON_URL = 'data/certificates.json';

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeCertificateNumber(value) {
    return String(value || '').trim().toUpperCase();
}

function getFieldValue(record, key) {
    return escapeHtml(record?.[key] ?? '');
}

function renderEmptyState(message, iconClass) {
    const result = document.getElementById('verificationResult');
    if (!result) return;

    result.className = 'verify-result-empty';
    result.innerHTML = `
        <div class="verify-empty-state">
            <i class="${iconClass}"></i>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

function renderLoadingState() {
    const result = document.getElementById('verificationResult');
    if (!result) return;

    result.className = 'verify-result-empty';
    result.innerHTML = `
        <div class="verify-empty-state">
            <div class="certificate-spinner" style="margin-bottom:14px;"></div>
            <p>Checking the latest certificate index...</p>
        </div>
    `;
}

function renderFoundState(record) {
    const result = document.getElementById('verificationResult');
    if (!result) return;

    const status = String(record.status || 'UNKNOWN').trim();
    const normalizedStatus = status.toUpperCase();
    const badgeClass = normalizedStatus === 'ACTIVE'
        ? 'certificate-badge certificate-badge-success'
        : 'certificate-badge certificate-badge-neutral';
    const badgeIcon = normalizedStatus === 'ACTIVE' ? 'fa-check-circle' : 'fa-circle-info';

    result.className = 'verify-result-found';
    result.innerHTML = `
        <div class="verify-result-status">
            <span class="${badgeClass}"><i class="fas ${badgeIcon}"></i> Valid Certificate</span>
            <p>This certificate was found in the current JSON backup and matches the uploaded Excel master file.</p>
        </div>
        <div class="verify-field-list">
            <div class="verify-field-row"><span>Certificate Number</span><strong>${getFieldValue(record, 'certificate_number')}</strong></div>
            <div class="verify-field-row"><span>Customer</span><strong>${getFieldValue(record, 'issued_to')}</strong></div>
            <div class="verify-field-row"><span>Equipment</span><strong>${getFieldValue(record, 'equipment')}</strong></div>
            <div class="verify-field-row"><span>Date Issued</span><strong>${getFieldValue(record, 'calibration_date')}</strong></div>
            <div class="verify-field-row"><span>Valid Until</span><strong>${getFieldValue(record, 'expiry_date')}</strong></div>
            <div class="verify-field-row"><span>Status</span><strong>${getFieldValue(record, 'status')}</strong></div>
            <div class="verify-field-row"><span>Issued By</span><strong>${getFieldValue(record, 'issued_by')}</strong></div>
        </div>
        <div class="verify-result-footnote">
            <i class="fas fa-shield-halved"></i>
            <span>Issued data is read directly from the latest JSON backup generated from the Excel master file.</span>
        </div>
    `;
}

function renderNotFoundState() {
    const result = document.getElementById('verificationResult');
    if (!result) return;

    result.className = 'verify-result-empty';
    result.innerHTML = `
        <div class="verify-empty-state">
            <i class="fas fa-triangle-exclamation"></i>
            <p>Certificate Not Found</p>
        </div>
    `;
}

async function verifyCertificate(rawNumber) {
    const certificateNumber = normalizeCertificateNumber(rawNumber);
    const input = document.getElementById('certificateNumber');
    const button = document.getElementById('verifyButton');

    if (!certificateNumber) {
        renderEmptyState('Please enter a certificate number first.', 'fas fa-circle-exclamation');
        if (input) input.focus();
        return;
    }

    if (button) {
        button.disabled = true;
        button.dataset.originalLabel = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying';
    }

    renderLoadingState();

    try {
        const response = await fetch(CERTIFICATE_JSON_URL, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('Unable to load the certificate list.');
        }

        const certificates = await response.json();
        if (!Array.isArray(certificates)) {
            throw new Error('The certificate index is malformed.');
        }

        const match = certificates.find((record) => normalizeCertificateNumber(record?.certificate_number) === certificateNumber);

        if (match) {
            renderFoundState(match);
        } else {
            renderNotFoundState();
        }
    } catch (error) {
        renderEmptyState(error.message || 'Verification failed. Please try again.', 'fas fa-triangle-exclamation');
    } finally {
        if (button) {
            button.disabled = false;
            button.innerHTML = button.dataset.originalLabel || '<i class="fas fa-search"></i> Verify';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('verifyForm');
    const input = document.getElementById('certificateNumber');
    const resetButton = document.getElementById('resetButton');
    const params = new URLSearchParams(window.location.search);
    const certFromUrl = params.get('cert') || params.get('certificate');

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            verifyCertificate(input ? input.value : '');
        });
    }

    if (input) {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                verifyCertificate(input.value);
            }
        });
    }

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (input) {
                input.value = '';
                input.focus();
            }
            renderEmptyState('Enter a certificate number to begin verification.', 'fas fa-search');
        });
    }

    if (certFromUrl && input) {
        input.value = certFromUrl;
        verifyCertificate(certFromUrl);
    }
});
