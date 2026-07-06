<?php
declare(strict_types=1);

require_once __DIR__ . '/convert_excel.php';

function gemarc_redirect_to_dashboard(string $status, string $message, array $extra = []): void
{
    $params = array_merge([
        'status' => $status,
        'message' => $message,
    ], $extra);

    header('Location: index.php?' . http_build_query($params));
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    gemarc_redirect_to_dashboard('error', 'Invalid upload request. Please use the dashboard form.');
}

$stagedPath = gemarc_staging_excel_path();

try {
    $upload = gemarc_validate_uploaded_excel($_FILES['certificate_file'] ?? []);
    gemarc_ensure_directory(gemarc_uploads_dir());
    gemarc_ensure_directory(gemarc_data_dir());

    if (is_file($stagedPath) && !unlink($stagedPath)) {
        throw new RuntimeException('The server could not clear the temporary upload file.');
    }

    if (!move_uploaded_file((string) $upload['tmp_name'], $stagedPath)) {
        throw new RuntimeException('The Excel file could not be saved on the server.');
    }

    $result = gemarc_convert_certificate_upload($stagedPath, gemarc_excel_path(), gemarc_json_path());
    $message = sprintf(
        'Certificates.xlsx uploaded successfully. %d certificate record(s) are now available in the public JSON file.',
        (int) $result['count']
    );

    gemarc_redirect_to_dashboard('success', $message, [
        'count' => (string) $result['count'],
        'filename' => (string) $result['last_upload_filename'],
    ]);
} catch (Throwable $throwable) {
    if (is_file($stagedPath)) {
        @unlink($stagedPath);
    }

    gemarc_redirect_to_dashboard('error', $throwable->getMessage());
}
