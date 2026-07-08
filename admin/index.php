<?php
declare(strict_types=1);

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/includes/certificate_repository.php';

function gemarc_admin_escape(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function gemarc_admin_flash_palette(string $type): array
{
    return match ($type) {
        'success' => ['certificate-alert-success', 'fa-circle-check', 'Upload completed'],
        'error' => ['certificate-alert-error', 'fa-triangle-exclamation', 'Upload blocked'],
        default => ['certificate-alert-info', 'fa-circle-info', 'Dashboard ready'],
    };
}

function gemarc_admin_status_badge_class(string $status): string
{
    $status = strtoupper(trim($status));

    return match (true) {
        $status === 'ACTIVE' => 'certificate-badge-success',
        $status === 'EXPIRED' => 'certificate-badge-warning',
        $status !== '' => 'certificate-badge-neutral',
        default => 'certificate-badge-neutral',
    };
}

function gemarc_admin_status_label(string $status): string
{
    $status = strtoupper(trim($status));

    return $status !== '' ? $status : 'UNKNOWN';
}

function gemarc_admin_record_value(array $record, string $key): string
{
    return trim((string) ($record[$key] ?? ''));
}

function gemarc_admin_diff_list(array $items, string $emptyLabel): string
{
    if ($items === []) {
        return '<li class="certificate-diff-empty">' . gemarc_admin_escape($emptyLabel) . '</li>';
    }

    $output = '';
    foreach ($items as $item) {
        $output .= '<li>' . gemarc_admin_escape($item) . '</li>';
    }

    return $output;
}

$context = gemarc_dashboard_context();
$records = $context['records'];
$status = $context['status'];
$metadata = $context['metadata'];
$statistics = $context['statistics'];
$history = $context['history'];
$columns = $context['columns'];

$flashType = (string) ($_GET['status'] ?? '');
$flashMessage = trim((string) ($_GET['message'] ?? ''));
if ($flashMessage !== '') {
    $flashMessage = urldecode($flashMessage);
}

[$alertClass, $alertIcon, $alertTitle] = gemarc_admin_flash_palette($flashType);

$latestUpload = is_array($metadata['last_upload'] ?? null) ? $metadata['last_upload'] : [];
$latestDiff = is_array($latestUpload['diff'] ?? null) ? $latestUpload['diff'] : [
    'added' => [],
    'updated' => [],
    'removed' => [],
];

$bootstrap = [
    'records' => array_values($records),
    'columns' => $columns,
    'statistics' => $statistics,
    'history' => $history,
    'latestDiff' => $latestDiff,
    'metadata' => $metadata,
    'updatedAt' => date('c'),
];

$bootstrapJson = json_encode(
    $bootstrap,
    JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
);
if ($bootstrapJson === false) {
    $bootstrapJson = '{}';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Certificate Management | Gemarc Enterprises Inc.</title>
<meta content="Protected admin dashboard for Gemarc certificate uploads." name="description"/>
<link href="../styles.css" rel="stylesheet"/>
<link href="../certificate-system.css" rel="stylesheet"/>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet"/>
<link href="../images/gemarclogo.png" rel="icon"/>
</head>
<body class="certificate-system admin-page">
<div class="certificate-shell">
<header class="header certificate-topbar">
    <div class="container certificate-topbar-inner">
        <a class="logo-link" href="../index.html" aria-label="Gemarc Enterprises homepage">
            <img alt="Gemarc Enterprises" class="logo-img" src="../images/gemarclogo.png"/>
        </a>
        <div class="certificate-topbar-actions">
            <a class="certificate-button-ghost" href="../verify.html"><i class="fas fa-shield-halved"></i> Public Verify</a>
            <a class="certificate-button-secondary" href="../index.html"><i class="fas fa-arrow-left"></i> Back to Site</a>
        </div>
    </div>
</header>

<main>
    <section class="certificate-hero">
        <div class="container certificate-hero-grid">
            <div class="certificate-hero-card">
                <div class="certificate-kicker"><i class="fas fa-folder-open"></i> Certificate Management</div>
                <h1>Certificate Verification Management Dashboard</h1>
                <p>
                    Upload the latest certificate workbook to securely update the verification records.
                    Once uploaded, the public verification portal will automatically use the latest approved certificate information.
                </p>
                <div class="certificate-info-grid">
                    <div class="certificate-info-item">
                        <strong>Workflow</strong>
                        <span>Upload a new certificate workbook, validate its contents, and publish the updated verification records.</span>
                    </div>
                    <div class="certificate-info-item">
                        <strong>Compatibility</strong>
                        <span>All verified certificates become immediately available through the public certificate verification portal.</span>
                    </div>
                    <div class="certificate-info-item">
                        <strong>Backup</strong>
                        <span>Every uploaded workbook is securely archived for future reference and auditing.</span>
                    </div>
                    <div class="certificate-info-item">
                        <strong>Future Ready</strong>
                        <span>The dashboard reads through reusable helpers so a database backend can be added later with minimal change.</span>
                    </div>
                </div>
            </div>

            <aside class="certificate-panel certificate-upload-panel" aria-label="Upload new Excel file">
                <h2 class="panel-heading">Upload New Excel File</h2>
                <p class="panel-copy">Select the latest approved certificate workbook to update the online certificate verification records.</p>

                <div id="dashboardAlert">
                    <?php if ($flashMessage !== ''): ?>
                        <div class="certificate-alert <?php echo gemarc_admin_escape($alertClass); ?>" data-role="flash-alert">
                            <strong><i class="fas <?php echo gemarc_admin_escape($alertIcon); ?>"></i> <?php echo gemarc_admin_escape($alertTitle); ?>:</strong>
                            <?php echo gemarc_admin_escape($flashMessage); ?>
                        </div>
                    <?php endif; ?>
                </div>

                <form class="certificate-form" id="uploadForm" action="upload.php?format=json" method="post" enctype="multipart/form-data">
                    <div class="certificate-field">
                        <label for="certificateFile">Choose Excel Workbook</label>
                        <input class="certificate-file-input" id="certificateFile" name="certificate_file" type="file" accept=".xlsx" required/>
                        <div class="certificate-note" id="selectedFileName">No file chosen yet.</div>
                    </div>

                    <div class="certificate-upload-flow" aria-label="Upload progress">
                        <div class="certificate-upload-step" data-step="validate"><span class="step-index">1</span><span>Validate workbook</span></div>
                        <div class="certificate-upload-step" data-step="convert"><span class="step-index">2</span><span>Process Certificate Records</span></div>
                        <div class="certificate-upload-step" data-step="backup"><span class="step-index">3</span><span>Archive uploaded workbook</span></div>
                        <div class="certificate-upload-step" data-step="refresh"><span class="step-index">4</span><span>Publish verification records</span></div>
                    </div>

                    <div class="certificate-note" id="uploadProgressMessage">Ready to process a new workbook.</div>

                    <div class="certificate-actions">
                        <button class="certificate-button" id="uploadButton" type="submit"><i class="fas fa-upload"></i> Upload Excel</button>
                    </div>
                </form>

                <div class="certificate-upload-summary">
                    <div class="certificate-summary-row">
                        <strong>Upload Limit</strong>
                        <span>20 MB maximum</span>
                    </div>
                    <div class="certificate-summary-row">
                        <strong>Allowed Type</strong>
                        <span>.xlsx only</span>
                    </div>
                    <div class="certificate-summary-row">
                        <strong>Processing</strong>
                        <span>The uploaded workbook is validated, processed, archived, and published automatically.</span>
                    </div>
                </div>
            </aside>
        </div>
    </section>

    <section class="certificate-content-grid">
        <div class="container">
            <div class="certificate-stats-grid">
                <div class="certificate-stat">
                    <span class="certificate-stat-label">Total Certificates</span>
                    <span class="certificate-stat-value" data-stat="total_certificates"><?php echo number_format((int) $statistics['total_certificates']); ?></span>
                    <span class="certificate-stat-meta">All rows currently cached in certificates.json.</span>
                </div>
                <div class="certificate-stat">
                    <span class="certificate-stat-label">Active Certificates</span>
                    <span class="certificate-stat-value" data-stat="active_certificates"><?php echo number_format((int) $statistics['active_certificates']); ?></span>
                    <span class="certificate-stat-meta">Certificates marked active or still within their validity window.</span>
                </div>
                <div class="certificate-stat">
                    <span class="certificate-stat-label">Expired Certificates</span>
                    <span class="certificate-stat-value" data-stat="expired_certificates"><?php echo number_format((int) $statistics['expired_certificates']); ?></span>
                    <span class="certificate-stat-meta">Records that are expired or flagged as expired in the workbook.</span>
                </div>
                <div class="certificate-stat">
                    <span class="certificate-stat-label">Last Upload Date</span>
                    <span class="certificate-stat-value" data-stat="last_upload_date"><?php echo gemarc_admin_escape($statistics['last_upload_date']); ?></span>
                    <span class="certificate-stat-meta">Most recent import recorded in upload_metadata.json.</span>
                </div>
                <div class="certificate-stat">
                    <span class="certificate-stat-label">Current Excel Backup</span>
                    <span class="certificate-stat-value" data-stat="current_excel_backup"><?php echo gemarc_admin_escape($statistics['current_excel_backup']); ?></span>
                    <span class="certificate-stat-meta">Latest workbook saved in the uploads directory.</span>
                </div>
                <div class="certificate-stat">
                    <span class="certificate-stat-label">Current JSON Size</span>
                    <span class="certificate-stat-value" data-stat="current_json_size_label"><?php echo gemarc_admin_escape($statistics['current_json_size_label']); ?></span>
                    <span class="certificate-stat-meta">Cache footprint used by the public verifier.</span>
                </div>
            </div>
        </div>
    </section>

    <section class="certificate-content-grid">
        <div class="container certificate-dashboard-grid">
            <div class="certificate-panel certificate-table-panel">
                <div class="certificate-panel-header">
                    <div>
                        <h2 class="certificate-section-heading"> Certificate Table</h2>
                        <p class="certificate-section-copy">Search, sort, paginate, and open any certificate for full details.</p>
                    </div>
                    <div class="certificate-table-toolbar">
                        <div class="certificate-search-wrap">
                            <i class="fas fa-magnifying-glass"></i>
                            <input class="certificate-search" id="certificateSearch" type="search" placeholder="Search certificate number, customer, equipment..." aria-label="Search certificates"/>
                        </div>
                        <label class="certificate-page-size">
                            <span>Rows</span>
                            <select id="pageSizeSelect" aria-label="Rows per page">
                                <option value="5">5</option>
                                <option value="10" selected>10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                        </label>
                    </div>
                </div>

                <div class="certificate-table-wrap">
                    <table class="certificate-table" aria-describedby="certificateTableSummary">
                        <thead>
                            <tr>
                                <?php foreach ($columns as $column): ?>
                                    <th scope="col">
                                        <button class="certificate-sort-button" type="button" data-sort-key="<?php echo gemarc_admin_escape($column['key']); ?>">
                                            <?php echo gemarc_admin_escape($column['label']); ?>
                                            <i class="fas fa-sort"></i>
                                        </button>
                                    </th>
                                <?php endforeach; ?>
                            </tr>
                        </thead>
                        <tbody id="certificateTableBody">
                            <?php if ($records === []): ?>
                                <tr class="certificate-table-empty-row">
                                    <td colspan="8">No certificates are available yet. Upload an Excel workbook to populate the dashboard.</td>
                                </tr>
                            <?php else: ?>
                                <?php foreach ($records as $index => $record): ?>
                                    <?php $recordStatus = gemarc_admin_status_label(gemarc_record_status($record)); ?>
                                    <tr class="certificate-table-row" data-record-index="<?php echo (int) $index; ?>" tabindex="0" role="button" aria-label="View details for certificate <?php echo gemarc_admin_escape(gemarc_admin_record_value($record, 'certificate_number')); ?>">
                                        <td><?php echo gemarc_admin_escape(gemarc_record_label_value($record, 'certificate_number')); ?></td>
                                        <td><?php echo gemarc_admin_escape(gemarc_record_label_value($record, 'issued_to')); ?></td>
                                        <td><?php echo gemarc_admin_escape(gemarc_record_label_value($record, 'equipment')); ?></td>
                                        <td><?php echo gemarc_admin_escape(gemarc_record_label_value($record, 'serial_number')); ?></td>
                                        <td><?php echo gemarc_admin_escape(gemarc_record_label_value($record, 'calibration_date')); ?></td>
                                        <td><?php echo gemarc_admin_escape(gemarc_record_label_value($record, 'expiry_date')); ?></td>
                                        <td>
                                            <span class="certificate-badge <?php echo gemarc_admin_escape(gemarc_admin_status_badge_class($recordStatus)); ?>">
                                                <?php echo gemarc_admin_escape($recordStatus); ?>
                                            </span>
                                        </td>
                                        <td><?php echo gemarc_admin_escape(gemarc_record_label_value($record, 'issued_by')); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>

                <div class="certificate-table-footer">
                    <div class="certificate-note" id="certificateTableSummary">Showing <?php echo number_format(count($records)); ?> certificate(s).</div>
                    <div class="certificate-pagination" id="certificatePagination"></div>
                </div>
            </div>

            </div>
        </div>


        </div>
    
<section class="container certificate-secondary-panels">
<div class="certificate-sidebar">
                <div class="certificate-panel">
                    <h2 class="certificate-section-heading">Upload History</h2>
                    <p class="certificate-section-copy">Latest upload metadata is stored in data/upload_metadata.json for quick review.</p>
                    <div class="certificate-history-list" id="uploadHistoryList">
                        <?php if ($history === []): ?>
                            <div class="certificate-history-empty">No upload history has been recorded yet.</div>
                        <?php else: ?>
                            <?php foreach ($history as $entry): ?>
                                <article class="certificate-history-item">
                                    <div class="certificate-history-topline">
                                        <strong><?php echo gemarc_admin_escape((string) ($entry['uploaded_filename'] ?? 'Certificates.xlsx')); ?></strong>
                                        <span><?php echo gemarc_admin_escape((string) ($entry['last_upload_date'] ?? 'Unknown date')); ?></span>
                                    </div>
                                    <div class="certificate-history-meta">
                                        <span><?php echo number_format((int) ($entry['certificate_count'] ?? 0)); ?> certificates</span>
                                        <span><?php echo gemarc_admin_escape(gemarc_format_json_size((int) ($entry['json_size'] ?? 0))); ?></span>
                                        <span>Uploader: <?php echo gemarc_admin_escape((string) ($entry['uploader'] ?? 'Unknown')); ?></span>
                                    </div>
                                </article>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>

                <div class="certificate-panel">
                    <h2 class="certificate-section-heading">Difference Report</h2>
                    <p class="certificate-section-copy">The dashboard compares the previous JSON cache against the newly uploaded workbook.</p>
                    <div class="certificate-diff-grid" id="differenceReport">
                        <div class="certificate-diff-card">
                            <h3>Added Certificates <span data-diff-count="added"><?php echo number_format((int) ($latestDiff['added_count'] ?? count($latestDiff['added'] ?? []))); ?></span></h3>
                            <ul data-diff-list="added">
                                <?php echo gemarc_admin_diff_list((array) ($latestDiff['added'] ?? []), 'No additions yet.'); ?>
                            </ul>
                        </div>
                        <div class="certificate-diff-card">
                            <h3>Updated Certificates <span data-diff-count="updated"><?php echo number_format((int) ($latestDiff['updated_count'] ?? count($latestDiff['updated'] ?? []))); ?></span></h3>
                            <ul data-diff-list="updated">
                                <?php echo gemarc_admin_diff_list((array) ($latestDiff['updated'] ?? []), 'No updates yet.'); ?>
                            </ul>
                        </div>
                        <div class="certificate-diff-card">
                            <h3>Removed Certificates <span data-diff-count="removed"><?php echo number_format((int) ($latestDiff['removed_count'] ?? count($latestDiff['removed'] ?? []))); ?></span></h3>
                            <ul data-diff-list="removed">
                                <?php echo gemarc_admin_diff_list((array) ($latestDiff['removed'] ?? []), 'No removals yet.'); ?>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="certificate-panel">
                    <h2 class="certificate-section-heading">Downloads</h2>
                    <p class="certificate-section-copy">Retrieve the generated JSON cache or the current Excel backup.</p>
                    <div class="certificate-actions">
                        <a class="certificate-button-secondary" href="download_backup.php?file=json"><i class="fas fa-file-code"></i> Download Current JSON</a>
                        <a class="certificate-button-ghost" href="download_backup.php?file=excel"><i class="fas fa-file-excel"></i> Download Current Excel Backup</a>
                    </div>
                </div>
            </div>
</section>
</section>
</main>

<div class="certificate-modal" id="certificateModal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="certificateModalTitle">
    <div class="certificate-modal-backdrop" data-modal-close></div>
    <div class="certificate-modal-card">
        <button class="certificate-modal-close" type="button" data-modal-close aria-label="Close certificate details"><i class="fas fa-xmark"></i></button>
        <div class="certificate-modal-header">
            <span class="certificate-kicker"><i class="fas fa-circle-info"></i> Certificate Details</span>
            <h2 id="certificateModalTitle">Certificate Details</h2>
            <p id="certificateModalSubtitle">Select a certificate to inspect the full record.</p>
        </div>
        <div class="certificate-modal-body" id="certificateModalBody"></div>
    </div>
</div>

<div class="certificate-loading-overlay" id="uploadOverlay" aria-hidden="true">
    <div class="certificate-loading-card">
        <div class="certificate-spinner"></div>
        <h3 class="certificate-loading-title" id="uploadOverlayTitle">Processing Excel file</h3>
        <p class="certificate-loading-copy" id="uploadOverlayCopy">Please wait while the workbook is validated, converted, and published to the public JSON cache.</p>
        <div class="certificate-overlay-steps" id="uploadOverlaySteps">
            <span data-step="validate">Validating workbook</span>
            <span data-step="convert">Generating JSON cache</span>
            <span data-step="backup">Saving Excel backup</span>
            <span data-step="refresh">Refreshing dashboard</span>
        </div>
    </div>
</div>
</div>

<script id="dashboardData" type="application/json"><?php echo $bootstrapJson; ?></script>
<script src="admin.js" defer></script>
</body>
</html>