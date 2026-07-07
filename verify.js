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
            <p>Verifying certificate...</p>
        </div>
    `;
}

function renderFoundState(record) {
    const result = document.getElementById('verificationResult');
    if (!result) return;

    const status = String(record.status || 'UNKNOWN').trim();
    const normalizedStatus = status.toUpperCase();

    const isActive = normalizedStatus === 'ACTIVE';

    const badgeClass = isActive
        ? 'certificate-badge certificate-badge-success'
        : 'certificate-badge certificate-badge-neutral';

    const badgeIcon = isActive
        ? 'fa-circle-check'
        : 'fa-circle-info';

    const statusColor = isActive ? '#1e7e34' : '#8a6d3b';

    result.className = 'verify-result-found';

    result.innerHTML = `
<div class="verify-result-status">

    <span class="${badgeClass}">
        <i class="fas ${badgeIcon}"></i>
        Certificate Successfully Verified
    </span>

    <p>
        This certificate has been successfully validated against the
        official calibration records maintained by
        <strong>Gemarc Enterprises Inc.</strong>
    </p>

</div>

<div class="verify-field-list">

    <div class="verify-field-row">
        <span>Certificate Number</span>
        <strong>${getFieldValue(record,'certificate_number')}</strong>
    </div>

    <div class="verify-field-row">
        <span>Customer</span>
        <strong>${getFieldValue(record,'issued_to')}</strong>
    </div>

    <div class="verify-field-row">
        <span>Equipment</span>
        <strong>${getFieldValue(record,'equipment')}</strong>
    </div>

    <div class="verify-field-row">
        <span>Serial Number</span>
        <strong>${getFieldValue(record,'serial_number')}</strong>
    </div>

    <div class="verify-field-row">
        <span>Calibration Date</span>
        <strong>${getFieldValue(record,'calibration_date')}</strong>
    </div>

    <div class="verify-field-row">
        <span>Valid Until</span>
        <strong>${getFieldValue(record,'expiry_date')}</strong>
    </div>

    <div class="verify-field-row">
        <span>Status</span>
        <strong style="color:${statusColor}">
            ${getFieldValue(record,'status')}
        </strong>
    </div>

</div>

<div class="verify-result-footnote">

    <i class="fas fa-shield-check"></i>

    <span>

        This verification confirms that the certificate information
        displayed above matches the official records maintained by
        <strong>Gemarc Enterprises Inc.</strong>

        <br><br>

        For questions regarding this certificate, please contact
        Gemarc Enterprises Inc.

    </span>

</div>
`;
}

function renderNotFoundState() {
    const result = document.getElementById('verificationResult');
    if (!result) return;

    result.className = 'verify-result-empty';

    result.innerHTML = `
<div class="verify-empty-state">

    <i class="fas fa-circle-xmark"
       style="font-size:60px;color:#dc3545;margin-bottom:20px;"></i>

    <h3 style="margin-bottom:10px;">
        Certificate Not Found
    </h3>

    <p style="max-width:520px;margin:auto;line-height:1.7">

        We could not locate a certificate matching the certificate
        number you entered.

        <br><br>

        Please verify the certificate number and try again.

        If you believe this certificate should exist,
        kindly contact Gemarc Enterprises Inc. for assistance.

    </p>

</div>
`;
}

async function verifyCertificate(rawNumber) {
    const certificateNumber = normalizeCertificateNumber(rawNumber);
    const input = document.getElementById('certificateNumber');
    const button = document.getElementById('verifyButton');

    if (!certificateNumber) {
        renderEmptyState('Please enter a valid certificate number.', 'fas fa-circle-exclamation');
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
            throw new Error('Unable to retrieve certificate records.');
        }

        const certificates = await response.json();
        if (!Array.isArray(certificates)) {
            throw new Error('Certificate records could not be processed.');
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
