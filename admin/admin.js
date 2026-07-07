document.addEventListener('DOMContentLoaded', () => {
    const bootstrapElement = document.getElementById('dashboardData');
    let bootstrap = {};

    try {
        bootstrap = bootstrapElement ? JSON.parse(bootstrapElement.textContent || '{}') : {};
    } catch (error) {
        bootstrap = {};
    }

    const state = {
        records: Array.isArray(bootstrap.records) ? bootstrap.records : [],
        columns: Array.isArray(bootstrap.columns) ? bootstrap.columns : [],
        statistics: bootstrap.statistics || {},
        history: Array.isArray(bootstrap.history) ? bootstrap.history : [],
        latestDiff: bootstrap.latestDiff || { added: [], updated: [], removed: [] },
        search: '',
        sortKey: 'certificate_number',
        sortDirection: 'asc',
        pageSize: 10,
        page: 1,
    };

    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('certificateFile');
    const fileLabel = document.getElementById('selectedFileName');
    const overlay = document.getElementById('uploadOverlay');
    const overlayTitle = document.getElementById('uploadOverlayTitle');
    const overlayCopy = document.getElementById('uploadOverlayCopy');
    const overlaySteps = overlay ? Array.from(overlay.querySelectorAll('[data-step]')) : [];
    const uploadProgressMessage = document.getElementById('uploadProgressMessage');
    const uploadButton = document.getElementById('uploadButton');
    const alertSlot = document.getElementById('dashboardAlert');
    const searchInput = document.getElementById('certificateSearch');
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    const tableBody = document.getElementById('certificateTableBody');
    const tableSummary = document.getElementById('certificateTableSummary');
    const pagination = document.getElementById('certificatePagination');
    const modal = document.getElementById('certificateModal');
    const modalTitle = document.getElementById('certificateModalTitle');
    const modalSubtitle = document.getElementById('certificateModalSubtitle');
    const modalBody = document.getElementById('certificateModalBody');
    const diffLists = {
        added: document.querySelector('[data-diff-list="added"]'),
        updated: document.querySelector('[data-diff-list="updated"]'),
        removed: document.querySelector('[data-diff-list="removed"]'),
    };
    const diffCounts = {
        added: document.querySelector('[data-diff-count="added"]'),
        updated: document.querySelector('[data-diff-count="updated"]'),
        removed: document.querySelector('[data-diff-count="removed"]'),
    };
    const statTargets = {
        total_certificates: document.querySelector('[data-stat="total_certificates"]'),
        active_certificates: document.querySelector('[data-stat="active_certificates"]'),
        expired_certificates: document.querySelector('[data-stat="expired_certificates"]'),
        last_upload_date: document.querySelector('[data-stat="last_upload_date"]'),
        current_excel_backup: document.querySelector('[data-stat="current_excel_backup"]'),
        current_json_size_label: document.querySelector('[data-stat="current_json_size_label"]'),
    };

    const defaultColumns = [
        { key: 'certificate_number', label: 'Certificate Number' },
        { key: 'issued_to', label: 'Customer' },
        { key: 'equipment', label: 'Equipment' },
        { key: 'serial_number', label: 'Serial Number' },
        { key: 'calibration_date', label: 'Calibration Date' },
        { key: 'expiry_date', label: 'Expiry Date' },
        { key: 'status', label: 'Status' },
    ];

    function getColumns() {
        return state.columns.length > 0 ? state.columns : defaultColumns;
    }

    function getFieldLabel(key) {
        const columns = getColumns();
        const match = columns.find((column) => column.key === key);
        return match ? match.label : titleCase(key);
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalizeText(value) {
        return String(value ?? '').trim().toLowerCase();
    }

    function getValue(record, key) {
        return String(record?.[key] ?? '').trim();
    }

    function displayValue(record, key) {
        const value = getValue(record, key);
        return value !== '' ? value : '—';
    }

    function titleCase(value) {
        return String(value || '')
            .replace(/[_-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
    }

    function getStatus(record) {
        const status = getValue(record, 'status').toUpperCase();
        return status || 'UNKNOWN';
    }

    function statusBadgeClass(status) {
        if (status === 'ACTIVE') {
            return 'certificate-badge-success';
        }

        if (status === 'EXPIRED') {
            return 'certificate-badge-warning';
        }

        return 'certificate-badge-neutral';
    }

    function formatJsonSize(bytes) {
        const value = Number(bytes || 0);
        if (value <= 0) {
            return '0 KB';
        }
        if (value < 1024) {
            return `${value} B`;
        }
        return `${(value / 1024).toFixed(1)} KB`;
    }

    function buildSearchText(record) {
        return Object.values(record || {})
            .map((value) => String(value ?? ''))
            .join(' ')
            .toLowerCase();
    }

    function sortedFilteredRecords() {
        const term = normalizeText(state.search);
        const direction = state.sortDirection === 'asc' ? 1 : -1;
        const items = state.records.map((record, index) => ({
            record,
            index,
            searchable: buildSearchText(record),
        }));

        const filtered = term === ''
            ? items
            : items.filter((item) => item.searchable.includes(term));

        filtered.sort((left, right) => {
            const leftValue = normalizeText(getValue(left.record, state.sortKey));
            const rightValue = normalizeText(getValue(right.record, state.sortKey));

            if (leftValue < rightValue) {
                return -1 * direction;
            }

            if (leftValue > rightValue) {
                return 1 * direction;
            }

            return 0;
        });

        return filtered;
    }

    function setOverlayVisible(visible) {
        if (!overlay) {
            return;
        }

        overlay.style.display = visible ? 'flex' : 'none';
        overlay.setAttribute('aria-hidden', visible ? 'false' : 'true');
    }

    function setOverlayStep(stepKey, stepTitle) {
        if (overlayTitle) {
            overlayTitle.textContent = stepTitle || 'Processing Excel file';
        }

        if (overlayCopy) {
            overlayCopy.textContent = 'Please wait while the workbook is validated, converted, and published to the public JSON cache.';
        }

        overlaySteps.forEach((step) => {
            const currentKey = step.getAttribute('data-step');
            step.classList.toggle('is-active', currentKey === stepKey);
            step.classList.toggle('is-complete', ['validate', 'convert', 'backup'].includes(currentKey) && ['convert', 'backup', 'refresh'].includes(stepKey) && currentKey !== stepKey);
        });
    }

    function showAlert(type, title, message) {
        if (!alertSlot) {
            return;
        }

        const palette = {
            success: ['certificate-alert-success', 'fa-circle-check'],
            error: ['certificate-alert-error', 'fa-triangle-exclamation'],
            info: ['certificate-alert-info', 'fa-circle-info'],
        }[type] || ['certificate-alert-info', 'fa-circle-info'];

        alertSlot.innerHTML = `
            <div class="certificate-alert ${palette[0]}" data-role="flash-alert">
                <strong><i class="fas ${palette[1]}"></i> ${escapeHtml(title)}:</strong>
                ${escapeHtml(message)}
            </div>
        `;
    }

    function renderStats(stats) {
        if (statTargets.total_certificates) {
            statTargets.total_certificates.textContent = Number(stats.total_certificates || 0).toLocaleString();
        }
        if (statTargets.active_certificates) {
            statTargets.active_certificates.textContent = Number(stats.active_certificates || 0).toLocaleString();
        }
        if (statTargets.expired_certificates) {
            statTargets.expired_certificates.textContent = Number(stats.expired_certificates || 0).toLocaleString();
        }
        if (statTargets.last_upload_date) {
            statTargets.last_upload_date.textContent = stats.last_upload_date || 'No upload yet';
        }
        if (statTargets.current_excel_backup) {
            statTargets.current_excel_backup.textContent = stats.current_excel_backup || 'Certificates.xlsx';
        }
        if (statTargets.current_json_size_label) {
            statTargets.current_json_size_label.textContent = stats.current_json_size_label || '0 KB';
        }
    }

    function renderHistory(history) {
        const target = document.getElementById('uploadHistoryList');
        if (!target) {
            return;
        }

        if (!Array.isArray(history) || history.length === 0) {
            target.innerHTML = '<div class="certificate-history-empty">No upload history has been recorded yet.</div>';
            return;
        }

        target.innerHTML = history.map((entry) => `
            <article class="certificate-history-item">
                <div class="certificate-history-topline">
                    <strong>${escapeHtml(entry.uploaded_filename || 'Certificates.xlsx')}</strong>
                    <span>${escapeHtml(entry.last_upload_date || 'Unknown date')}</span>
                </div>
                <div class="certificate-history-meta">
                    <span>${Number(entry.certificate_count || 0).toLocaleString()} certificates</span>
                    <span>${escapeHtml(entry.json_size_label || formatJsonSize(entry.json_size || 0))}</span>
                    <span>Uploader: ${escapeHtml(entry.uploader || 'Unknown')}</span>
                </div>
            </article>
        `).join('');
    }

    function renderDiff(diff) {
        const safeDiff = diff || { added: [], updated: [], removed: [] };
        const added = Array.isArray(safeDiff.added) ? safeDiff.added : [];
        const updated = Array.isArray(safeDiff.updated) ? safeDiff.updated : [];
        const removed = Array.isArray(safeDiff.removed) ? safeDiff.removed : [];

        if (diffLists.added) {
            diffLists.added.innerHTML = formatList(added, 'No additions yet.');
        }
        if (diffLists.updated) {
            diffLists.updated.innerHTML = formatList(updated, 'No updates yet.');
        }
        if (diffLists.removed) {
            diffLists.removed.innerHTML = formatList(removed, 'No removals yet.');
        }

        if (diffCounts.added) {
            diffCounts.added.textContent = Number(safeDiff.added_count ?? added.length).toLocaleString();
        }
        if (diffCounts.updated) {
            diffCounts.updated.textContent = Number(safeDiff.updated_count ?? updated.length).toLocaleString();
        }
        if (diffCounts.removed) {
            diffCounts.removed.textContent = Number(safeDiff.removed_count ?? removed.length).toLocaleString();
        }
    }

    function formatList(items, emptyLabel) {
        if (!items || items.length === 0) {
            return `<li class="certificate-diff-empty">${escapeHtml(emptyLabel)}</li>`;
        }

        return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    }

    function renderTable() {
        if (!tableBody) {
            return;
        }

        const filtered = sortedFilteredRecords();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
        state.page = Math.min(Math.max(1, state.page), totalPages);

        const start = (state.page - 1) * state.pageSize;
        const pageRecords = filtered.slice(start, start + state.pageSize);

        if (total === 0) {
            tableBody.innerHTML = '<tr class="certificate-table-empty-row"><td colspan="8">No matching certificates were found.</td></tr>';
            if (tableSummary) {
                tableSummary.textContent = 'No matching certificates found.';
            }
            if (pagination) {
                pagination.innerHTML = '';
            }
            return;
        }

        tableBody.innerHTML = pageRecords.map(({ record, index }) => {
            const status = getStatus(record);
            const cells = getColumns().map((column) => {
                if (column.key === 'status') {
                    return `<td><span class="certificate-badge ${statusBadgeClass(status)}">${escapeHtml(status)}</span></td>`;
                }

                return `<td>${escapeHtml(displayValue(record, column.key))}</td>`;
            }).join('');

            return `
                <tr class="certificate-table-row" data-record-index="${index}" tabindex="0" role="button" aria-label="View details for certificate ${escapeHtml(displayValue(record, 'certificate_number'))}">
                    ${cells}
                </tr>
            `;
        }).join('');

        if (tableSummary) {
            const first = start + 1;
            const last = Math.min(start + pageRecords.length, total);
            tableSummary.textContent = `Showing ${first}-${last} of ${total} certificate(s).`;
        }

        if (pagination) {
            pagination.innerHTML = `
                <button type="button" class="certificate-page-button" data-page-action="prev" ${state.page <= 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i> Prev</button>
                <span class="certificate-page-status">Page ${state.page} of ${totalPages}</span>
                <button type="button" class="certificate-page-button" data-page-action="next" ${state.page >= totalPages ? 'disabled' : ''}>Next <i class="fas fa-chevron-right"></i></button>
            `;
        }

        refreshSortButtons();
    }

    function renderModal(record) {
        if (!modal || !modalTitle || !modalSubtitle || !modalBody) {
            return;
        }

        const certificateNumber = displayValue(record, 'certificate_number');
        modalTitle.textContent = certificateNumber !== '—' ? certificateNumber : 'Certificate Details';
        modalSubtitle.textContent = `${displayValue(record, 'issued_to')} · ${displayValue(record, 'equipment')}`;

        const preferredOrder = getColumns().map((column) => column.key);
        const extraKeys = Object.keys(record || {}).filter((key) => !preferredOrder.includes(key));
        const displayKeys = [...preferredOrder, ...extraKeys];

        modalBody.innerHTML = displayKeys.map((key) => {
            const label = getFieldLabel(key);
            return `
                <div class="certificate-detail">
                    <label>${escapeHtml(label)}</label>
                    <span>${escapeHtml(displayValue(record, key))}</span>
                </div>
            `;
        }).join('');

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        if (!modal) {
            return;
        }

        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    function renderDashboard() {
        renderStats(state.statistics);
        renderHistory(state.history);
        renderDiff(state.latestDiff);
        renderTable();
        window.GemarcCertificateDashboard = state;
    }

    async function submitUpload(event) {
        event.preventDefault();

        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            showAlert('error', 'Upload blocked', 'Please choose an Excel file before uploading.');
            return;
        }

        if (!window.confirm('This will replace the current JSON cache with the uploaded Excel workbook. Continue?')) {
            return;
        }

        const progressSteps = [
            ['validate', 'Validating workbook'],
            ['convert', 'Generating JSON cache'],
            ['backup', 'Saving Excel backup'],
            ['refresh', 'Refreshing dashboard'],
        ];

        const formData = new FormData(uploadForm);
        setOverlayVisible(true);
        setOverlayStep('validate', 'Validating workbook');

        if (uploadProgressMessage) {
            uploadProgressMessage.textContent = 'Validating workbook...';
        }
        if (uploadButton) {
            uploadButton.disabled = true;
            uploadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading';
        }

        let stepIndex = 0;
        const stepTimer = window.setInterval(() => {
            const [stepKey, label] = progressSteps[Math.min(stepIndex, progressSteps.length - 1)];
            setOverlayStep(stepKey, label);
            if (uploadProgressMessage) {
                uploadProgressMessage.textContent = `${label}...`;
            }
            stepIndex += 1;
        }, 850);

        try {
            const response = await fetch(uploadForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'fetch',
                },
                cache: 'no-store',
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok || !payload.success) {
                throw new Error(payload.message || 'Upload failed.');
            }

            if (payload.dashboard) {
                state.records = Array.isArray(payload.dashboard.records) ? payload.dashboard.records : state.records;
                state.columns = Array.isArray(payload.dashboard.columns) ? payload.dashboard.columns : state.columns;
                state.statistics = payload.dashboard.statistics || state.statistics;
                state.history = Array.isArray(payload.dashboard.history) ? payload.dashboard.history : state.history;
                state.latestDiff = payload.result?.diff || payload.dashboard.latestDiff || state.latestDiff;
            }

            state.search = searchInput ? searchInput.value : '';
            state.page = 1;
            renderDashboard();

            if (fileInput) {
                fileInput.value = '';
            }
            if (fileLabel) {
                fileLabel.textContent = 'No file chosen yet.';
            }

            showAlert('success', 'Upload completed', payload.message || 'The dashboard has been refreshed.');
            if (uploadProgressMessage) {
                uploadProgressMessage.textContent = 'Upload completed successfully.';
            }
            setOverlayStep('refresh', 'Dashboard refreshed');
            window.setTimeout(() => setOverlayVisible(false), 600);
        } catch (error) {
            showAlert('error', 'Upload blocked', error.message || 'Upload failed.');
            if (uploadProgressMessage) {
                uploadProgressMessage.textContent = error.message || 'Upload failed.';
            }
            setOverlayStep('validate', 'Upload failed');
            window.setTimeout(() => setOverlayVisible(false), 400);
        } finally {
            window.clearInterval(stepTimer);
            if (uploadButton) {
                uploadButton.disabled = false;
                uploadButton.innerHTML = '<i class="fas fa-upload"></i> Upload Excel';
            }
        }
    }

    if (fileInput && fileLabel) {
        fileInput.addEventListener('change', () => {
            fileLabel.textContent = fileInput.files && fileInput.files.length > 0 ? fileInput.files[0].name : 'No file chosen yet.';
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            state.search = searchInput.value;
            state.page = 1;
            renderTable();
        });
    }

    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', () => {
            state.pageSize = Number(pageSizeSelect.value) || 10;
            state.page = 1;
            renderTable();
        });
    }

    if (tableBody) {
        tableBody.addEventListener('click', (event) => {
            const row = event.target.closest('.certificate-table-row');
            if (!row) {
                return;
            }

            const index = Number(row.getAttribute('data-record-index'));
            if (!Number.isNaN(index) && state.records[index]) {
                renderModal(state.records[index]);
            }
        });

        tableBody.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }

            const row = event.target.closest('.certificate-table-row');
            if (!row) {
                return;
            }

            event.preventDefault();
            const index = Number(row.getAttribute('data-record-index'));
            if (!Number.isNaN(index) && state.records[index]) {
                renderModal(state.records[index]);
            }
        });
    }

    if (pagination) {
        pagination.addEventListener('click', (event) => {
            const button = event.target.closest('[data-page-action]');
            if (!button || button.disabled) {
                return;
            }

            const action = button.getAttribute('data-page-action');
            const totalPages = Math.max(1, Math.ceil(sortedFilteredRecords().length / state.pageSize));

            if (action === 'prev' && state.page > 1) {
                state.page -= 1;
            }

            if (action === 'next' && state.page < totalPages) {
                state.page += 1;
            }

            renderTable();
        });
    }

    document.querySelectorAll('.certificate-sort-button').forEach((button) => {
        button.addEventListener('click', () => {
            const sortKey = button.getAttribute('data-sort-key') || 'certificate_number';
            if (state.sortKey === sortKey) {
                state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                state.sortKey = sortKey;
                state.sortDirection = 'asc';
            }
            renderTable();
        });
    });

    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target.closest('[data-modal-close]')) {
                closeModal();
            }
        });
    }

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    });

    if (uploadForm) {
        uploadForm.addEventListener('submit', submitUpload);
    }

    if (searchInput) {
        state.search = searchInput.value;
    }

    function refreshSortButtons() {
        document.querySelectorAll('.certificate-sort-button').forEach((button) => {
            const key = button.getAttribute('data-sort-key') || '';
            const icon = button.querySelector('i');
            if (!icon) {
                return;
            }

            if (key === state.sortKey) {
                icon.className = state.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
            } else {
                icon.className = 'fas fa-sort';
            }
        });
    }

    renderDashboard();
    setOverlayVisible(false);
    window.GemarcCertificateDashboard = state;
});