<?php
declare(strict_types=1);

require_once __DIR__ . '/certificate_tools.php';

function gemarc_certificate_table_columns(): array
{
    return [
        ['key' => 'certificate_number', 'label' => 'Certificate Number'],
        ['key' => 'customer', 'label' => 'Customer'],
        ['key' => 'equipment', 'label' => 'Equipment'],
        ['key' => 'serial_number', 'label' => 'Serial Number'],
        ['key' => 'calibration_date', 'label' => 'Calibration Date'],
        ['key' => 'expiry_date', 'label' => 'Expiry Date'],
        ['key' => 'status', 'label' => 'Status'],
        ['key' => 'issued_by', 'label' => 'Issued By'],
    ];
}

function gemarc_read_certificate_records(?string $jsonPath = null): array
{
    return gemarc_read_json_records($jsonPath ?? gemarc_json_path());
}

function gemarc_record_display_value(array $record, string $key): string
{
    $value = $record[$key] ?? '';

    if ($key === 'status') {
        return strtoupper(trim((string) $value));
    }

    return trim((string) $value);
}

function gemarc_record_label_value(array $record, string $key): string
{
    return gemarc_record_display_value($record, $key) !== '' ? gemarc_record_display_value($record, $key) : '—';
}

function gemarc_record_status(array $record): string
{
    $status = strtoupper(trim((string) ($record['status'] ?? '')));
    if ($status !== '') {
        if (str_contains($status, 'EXPIR')) {
            return 'expired';
        }

        if (str_contains($status, 'ACTIVE')) {
            return 'active';
        }
    }

    $expiry = trim((string) ($record['expiry_date'] ?? ''));
    if ($expiry !== '') {
        $expiryTimestamp = strtotime($expiry);
        if ($expiryTimestamp !== false && $expiryTimestamp < strtotime('today')) {
            return 'expired';
        }
    }

    return 'active';
}

function gemarc_count_active_certificates(array $records): int
{
    $count = 0;
    foreach ($records as $record) {
        if (is_array($record) && gemarc_record_status($record) === 'active') {
            $count++;
        }
    }

    return $count;
}

function gemarc_count_expired_certificates(array $records): int
{
    $count = 0;
    foreach ($records as $record) {
        if (is_array($record) && gemarc_record_status($record) === 'expired') {
            $count++;
        }
    }

    return $count;
}

function gemarc_format_json_size(int $bytes): string
{
    if ($bytes <= 0) {
        return '0 KB';
    }

    if ($bytes < 1024) {
        return $bytes . ' B';
    }

    return number_format($bytes / 1024, 1) . ' KB';
}

function gemarc_dashboard_statistics(?array $records = null, ?array $status = null, ?array $metadata = null): array
{
    $records = $records ?? gemarc_read_certificate_records();
    $status = $status ?? gemarc_read_certificate_status();
    $metadata = $metadata ?? gemarc_read_upload_metadata();

    $jsonPath = gemarc_json_path();
    $excelPath = gemarc_excel_path();
    $latestUpload = $metadata['last_upload'] ?? [];

    $lastUploadDate = (string) ($latestUpload['last_upload_date'] ?? ($status['last_upload_date'] ?? 'No upload yet'));
    $lastUploadFilename = (string) ($latestUpload['uploaded_filename'] ?? ($status['last_uploaded_filename'] ?? 'Certificates.xlsx'));
    $jsonSize = (int) ($latestUpload['json_size'] ?? ($status['json_size'] ?? (is_file($jsonPath) ? filesize($jsonPath) : 0)));

   return [
    'total_certificates' => count($records),
    'active_certificates' => gemarc_count_active_certificates($records),
    'expired_certificates' => gemarc_count_expired_certificates($records),
    'last_upload_date' => $lastUploadDate,

    'current_excel_backup' => $lastUploadFilename,

    'current_json_size' => $jsonSize,
    'current_json_size_label' => gemarc_format_json_size($jsonSize),
    'json_exists' => !empty($status['json_exists']),
    'excel_exists' => !empty($status['excel_exists']),
];
}

function gemarc_dashboard_upload_history(?array $metadata = null): array
{
    $metadata = $metadata ?? gemarc_read_upload_metadata();
    $history = $metadata['history'] ?? [];

    if (!is_array($history)) {
        return [];
    }

    return array_values(array_filter($history, static fn ($entry) => is_array($entry)));
}

function gemarc_dashboard_context(): array
{
    $records = gemarc_read_certificate_records();
    $status = gemarc_read_certificate_status();
    $metadata = gemarc_read_upload_metadata();
    $statistics = gemarc_dashboard_statistics($records, $status, $metadata);

    return [
        'records' => $records,
        'status' => $status,
        'metadata' => $metadata,
        'statistics' => $statistics,
        'history' => gemarc_dashboard_upload_history($metadata),
        'columns' => gemarc_certificate_table_columns(),
    ];
}
