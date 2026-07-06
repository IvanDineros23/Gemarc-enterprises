<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/certificate_tools.php';

$requestedFile = strtolower((string) ($_GET['file'] ?? 'json'));
$downloadMap = [
    'json' => [
        'path' => gemarc_json_path(),
        'name' => 'certificates.json',
        'mime' => 'application/json',
    ],
    'excel' => [
        'path' => gemarc_excel_path(),
        'name' => 'Certificates.xlsx',
        'mime' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
];

if (!isset($downloadMap[$requestedFile])) {
    http_response_code(400);
    echo 'Invalid download request.';
    exit;
}

$target = $downloadMap[$requestedFile];

if (!is_file($target['path'])) {
    http_response_code(404);
    echo 'The requested file is not available yet.';
    exit;
}

header('Content-Description: File Transfer');
header('Content-Type: ' . $target['mime']);
header('Content-Disposition: attachment; filename="' . $target['name'] . '"');
header('Content-Length: ' . (string) filesize($target['path']));
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

readfile($target['path']);
exit;
