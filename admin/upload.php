<?php

declare(strict_types=1);

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/convert_excel.php';
require_once __DIR__ . '/includes/certificate_repository.php';

function gemarc_redirect_to_dashboard(string $status, string $message, array $extra = []): void
{
    $params = array_merge([
        'status' => $status,
        'message' => $message,
    ], $extra);

    header('Location: index.php?' . http_build_query($params));
    exit;
}

function gemarc_request_expects_json(): bool
{
    $accept = strtolower((string) ($_SERVER['HTTP_ACCEPT'] ?? ''));
    $requestedWith = strtolower((string) ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? ''));
    $format = strtolower((string) ($_GET['format'] ?? ''));

    return $format === 'json' || str_contains($accept, 'application/json') || $requestedWith === 'xmlhttprequest' || $requestedWith === 'fetch';
}

function gemarc_upload_uploader_identity(): string
{
    $uploader = trim((string) ($_SERVER['PHP_AUTH_USER'] ?? $_SERVER['REMOTE_USER'] ?? ''));

    return $uploader !== '' ? $uploader : 'Unknown';
}

function gemarc_send_json_response(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    if (gemarc_request_expects_json()) {
        gemarc_send_json_response([
            'success' => false,
            'message' => 'Invalid upload request. Please use the dashboard form.',
        ], 405);
    }

    gemarc_redirect_to_dashboard('error', 'Invalid upload request. Please use the dashboard form.');
}

$stagedPath = gemarc_staging_excel_path();
$expectsJson = gemarc_request_expects_json();

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

   $originalFilename = $_FILES['certificate_file']['name'];

$result = gemarc_convert_certificate_upload(
    $stagedPath,
    gemarc_excel_path($originalFilename),
    gemarc_json_path(),
    gemarc_upload_metadata_path(),
    gemarc_upload_uploader_identity()
);

    $message = sprintf(
        '%s uploaded successfully. %d certificate record(s) are now available in the public verification portal.',
        basename($result['excel_path']),
        (int) $result['count']
    );

    if ($expectsJson) {
        gemarc_send_json_response([
            'success'   => true,
            'message'   => $message,
            'result'    => $result,
            'dashboard' => gemarc_dashboard_context(),
        ]);
    }

    gemarc_redirect_to_dashboard(
        'success',
        $message,
        [
            'count'    => (string) $result['count'],
            'filename' => basename($result['excel_path']),
        ]
    );

} catch (Throwable $exception) {

    if ($expectsJson) {
        gemarc_send_json_response([
            'success' => false,
            'message' => $exception->getMessage(),
            'file'    => $exception->getFile(),
            'line'    => $exception->getLine(),
            'trace'   => $exception->getTraceAsString(),
        ], 500);
    }

    gemarc_redirect_to_dashboard(
        'error',
        $exception->getMessage()
    );
}