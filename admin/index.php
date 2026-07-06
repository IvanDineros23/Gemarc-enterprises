<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/certificate_tools.php';

function gemarc_admin_escape(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

$status = gemarc_read_certificate_status();
$flashType = (string) ($_GET['status'] ?? '');
$flashMessage = trim((string) ($_GET['message'] ?? ''));

if ($flashMessage !== '') {
    $flashMessage = urldecode($flashMessage);
}

$alertClass = 'certificate-alert-info';
$alertIcon = 'fa-circle-info';
$alertTitle = 'Dashboard ready';

if ($flashType === 'success') {
    $alertClass = 'certificate-alert-success';
    $alertIcon = 'fa-circle-check';
    $alertTitle = 'Upload completed';
} elseif ($flashType === 'error') {
    $alertClass = 'certificate-alert-error';
    $alertIcon = 'fa-triangle-exclamation';
    $alertTitle = 'Upload blocked';
}

$certificateCount = (int) ($status['certificate_count'] ?? 0);
$lastUploadDate = (string) ($status['last_upload_date'] ?? 'No upload yet');
$lastUploadedFilename = (string) ($status['last_uploaded_filename'] ?? 'Certificates.xlsx');
$jsonState = !empty($status['json_exists']) ? 'Ready' : 'Missing';
$jsonSize = (int) ($status['json_size'] ?? 0);
$jsonSizeLabel = $jsonSize > 0 ? number_format((float) $jsonSize / 1024, 1) . ' KB' : '0 KB';
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
                <h1>Manage the Excel master file and regenerate the public JSON index.</h1>
                <p>
                    Upload the latest <strong>Certificates.xlsx</strong> workbook to replace the current JSON backup.
                    The system validates the Excel file, writes the JSON index, and keeps the approved workbook as the master backup.
                </p>
                <div class="certificate-info-grid">
                    <div class="certificate-info-item">
                        <strong>Workflow</strong>
                        <span>Upload Excel, validate it, convert rows to JSON, and publish the latest searchable dataset.</span>
                    </div>
                    <div class="certificate-info-item">
                        <strong>Security</strong>
                        <span>The /admin area is protected by Apache Basic Authentication. No login page, no sessions, no database.</span>
                    </div>
                    <div class="certificate-info-item">
                        <strong>Backup</strong>
                        <span>The uploaded workbook is stored as the master backup while the JSON file powers public verification.</span>
                    </div>
                    <div class="certificate-info-item">
                        <strong>QR Ready</strong>
                        <span>Every certificate can later link to the public verifier through a query string or QR code.</span>
                    </div>
                </div>

                <div class="certificate-upload-summary">
                    <div class="certificate-summary-row">
                        <strong>Current JSON Status</strong>
                        <span class="certificate-badge <?php echo $status['json_exists'] ? 'certificate-badge-success' : 'certificate-badge-warning'; ?>">
                            <i class="fas <?php echo $status['json_exists'] ? 'fa-circle-check' : 'fa-triangle-exclamation'; ?>"></i>
                            <?php echo gemarc_admin_escape($jsonState); ?>
                        </span>
                    </div>
                    <div class="certificate-summary-row">
                        <strong>Number of Certificates</strong>
                        <span><?php echo number_format($certificateCount); ?></span>
                    </div>
                    <div class="certificate-summary-row">
                        <strong>Last Upload Date</strong>
                        <span><?php echo gemarc_admin_escape($lastUploadDate); ?></span>
                    </div>
                    <div class="certificate-summary-row">
                        <strong>Last Uploaded Filename</strong>
                        <span><?php echo gemarc_admin_escape($lastUploadedFilename); ?></span>
                    </div>
                    <div class="certificate-summary-row">
                        <strong>Current JSON Size</strong>
                        <span><?php echo gemarc_admin_escape($jsonSizeLabel); ?></span>
                    </div>
                </div>
            </div>

            <aside class="certificate-panel" aria-label="Upload new Excel file">
                <h2 class="panel-heading">Upload New Excel File</h2>
                <p class="panel-copy">Choose the latest workbook and upload it to regenerate the public JSON backup.</p>

                <?php if ($flashMessage !== ''): ?>
                    <div class="certificate-alert <?php echo gemarc_admin_escape($alertClass); ?>">
                        <strong><i class="fas <?php echo gemarc_admin_escape($alertIcon); ?>"></i> <?php echo gemarc_admin_escape($alertTitle); ?>:</strong>
                        <?php echo gemarc_admin_escape($flashMessage); ?>
                    </div>
                <?php endif; ?>

                <form class="certificate-form" id="uploadForm" action="upload.php" method="post" enctype="multipart/form-data">
                    <div class="certificate-field">
                        <label for="certificateFile">Choose File</label>
                        <input class="certificate-file-input" id="certificateFile" name="certificate_file" type="file" accept=".xlsx" required/>
                        <div class="certificate-note" id="selectedFileName">No file chosen yet.</div>
                    </div>
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
                        <span>Confirm replacement, validate workbook, write JSON, then publish the backup</span>
                    </div>
                </div>
            </aside>
        </div>
    </section>

    <section class="certificate-content-grid">
        <div class="container">
            <div class="certificate-panel">
                <h2 class="certificate-section-heading">Downloads</h2>
                <p class="certificate-section-copy">Use these buttons to retrieve the current JSON index or the Excel backup.</p>
                <div class="certificate-actions">
                    <a class="certificate-button-secondary" href="download_backup.php?file=json"><i class="fas fa-file-code"></i> Download Current JSON</a>
                    <a class="certificate-button-ghost" href="download_backup.php?file=excel"><i class="fas fa-file-excel"></i> Download Current Excel Backup</a>
                </div>
            </div>
        </div>
    </section>
</main>

<div class="certificate-loading-overlay" id="uploadOverlay" aria-hidden="true">
    <div class="certificate-loading-card">
        <div class="certificate-spinner"></div>
        <h3 class="certificate-loading-title">Processing Excel file</h3>
        <p class="certificate-loading-copy">Please wait while the workbook is validated, converted, and published to the public JSON index.</p>
    </div>
</div>
</div>

<script src="admin.js" defer></script>
</body>
</html>
