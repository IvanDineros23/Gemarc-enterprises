<?php
declare(strict_types=1);

use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

function gemarc_project_root(): string
{
    return dirname(__DIR__, 2);
}

function gemarc_admin_dir(): string
{
    return gemarc_project_root() . DIRECTORY_SEPARATOR . 'admin';
}

function gemarc_data_dir(): string
{
    return gemarc_project_root() . DIRECTORY_SEPARATOR . 'data';
}

function gemarc_uploads_dir(): string
{
    return gemarc_project_root() . DIRECTORY_SEPARATOR . 'uploads';
}

function gemarc_json_path(): string
{
    return gemarc_data_dir() . DIRECTORY_SEPARATOR . 'certificates.json';
}

function gemarc_excel_path(): string
{
    return gemarc_uploads_dir() . DIRECTORY_SEPARATOR . 'Certificates.xlsx';
}

function gemarc_staging_excel_path(): string
{
    return gemarc_uploads_dir() . DIRECTORY_SEPARATOR . 'Certificates.xlsx.uploading';
}

function gemarc_ensure_directory(string $path): void
{
    if (!is_dir($path) && !mkdir($path, 0775, true) && !is_dir($path)) {
        throw new RuntimeException('Unable to create required directory: ' . $path);
    }
}

function gemarc_boot_phpspreadsheet(): void
{
    static $booted = false;

    if ($booted) {
        return;
    }

    $autoload = gemarc_project_root() . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';
    if (!is_file($autoload)) {
        throw new RuntimeException('PhpSpreadsheet is not installed. Run composer install before uploading certificates.');
    }

    require_once $autoload;
    $booted = true;
}

function gemarc_normalize_header(string $header): string
{
    $header = strtolower(trim($header));
    $header = preg_replace('/[^a-z0-9]+/', '_', $header);

    return trim((string) $header, '_');
}

function gemarc_expected_headers(): array
{
    return [
        'Certificate Number',
        'Issued To',
        'Equipment',
        'Serial Number',
        'Calibration Date',
        'Expiry Date',
        'Issued By',
        'Status',
    ];
}

function gemarc_header_to_json_key(string $header): string
{
    static $map = [
        'certificate_number' => 'certificate_number',
        'issued_to' => 'issued_to',
        'equipment' => 'equipment',
        'serial_number' => 'serial_number',
        'calibration_date' => 'calibration_date',
        'expiry_date' => 'expiry_date',
        'issued_by' => 'issued_by',
        'status' => 'status',
    ];

    $normalized = gemarc_normalize_header($header);

    return $map[$normalized] ?? $normalized;
}

function gemarc_cell_to_string(Cell $cell): string
{
    $value = $cell->getValue();

    if ($value === null || $value === '') {
        return '';
    }

    if (is_numeric($value) && ExcelDate::isDateTime($cell)) {
        $date = ExcelDate::excelToDateTimeObject((float) $value);

        return $date->format('Y-m-d');
    }

    return trim((string) $cell->getFormattedValue());
}

function gemarc_validate_uploaded_excel(array $file): array
{
    if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
        $message = gemarc_upload_error_message((int) ($file['error'] ?? UPLOAD_ERR_NO_FILE));
        throw new InvalidArgumentException($message);
    }

    if (!isset($file['name'], $file['tmp_name'], $file['size'])) {
        throw new InvalidArgumentException('Invalid upload payload received by the server.');
    }

    $extension = strtolower(pathinfo((string) $file['name'], PATHINFO_EXTENSION));
    if ($extension !== 'xlsx') {
        throw new InvalidArgumentException('Only .xlsx Excel files are allowed.');
    }

    $maxBytes = 20 * 1024 * 1024;
    if ((int) $file['size'] > $maxBytes) {
        throw new InvalidArgumentException('The uploaded file is too large. Maximum size is 20 MB.');
    }

    return $file;
}

function gemarc_upload_error_message(int $errorCode): string
{
    return match ($errorCode) {
        UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the maximum allowed size of 20 MB.',
        UPLOAD_ERR_PARTIAL => 'The upload was interrupted before it completed. Please try again.',
        UPLOAD_ERR_NO_FILE => 'Please choose an Excel file before uploading.',
        UPLOAD_ERR_NO_TMP_DIR => 'The server is missing a temporary upload directory.',
        UPLOAD_ERR_CANT_WRITE => 'The server could not write the uploaded file to disk.',
        UPLOAD_ERR_EXTENSION => 'The upload was blocked by a server extension.',
        default => 'The Excel upload could not be processed.',
    };
}

function gemarc_load_certificates_from_excel(string $excelPath): array
{
    gemarc_boot_phpspreadsheet();

    if (!is_file($excelPath)) {
        throw new InvalidArgumentException('The Excel backup could not be found at the expected location.');
    }

    $spreadsheet = IOFactory::load($excelPath);
    $sheet = $spreadsheet->getActiveSheet();
    $highestRow = (int) $sheet->getHighestDataRow();
    $highestColumn = (string) $sheet->getHighestDataColumn();
    $headerRange = 'A1:' . $highestColumn . '1';
    $headerRow = $sheet->rangeToArray($headerRange, null, true, false)[0] ?? [];

    $headerMap = [];
    foreach ($headerRow as $index => $rawHeader) {
        $normalized = gemarc_normalize_header((string) $rawHeader);
        if ($normalized !== '') {
            $headerMap[$normalized] = $index + 1;
        }
    }

    $missingHeaders = [];
    foreach (gemarc_expected_headers() as $requiredHeader) {
        $normalized = gemarc_normalize_header($requiredHeader);
        if (!isset($headerMap[$normalized])) {
            $missingHeaders[] = $requiredHeader;
        }
    }

    if ($missingHeaders !== []) {
        throw new InvalidArgumentException(
            'Missing required column(s): ' . implode(', ', $missingHeaders)
        );
    }

    $records = [];
    for ($rowNumber = 2; $rowNumber <= $highestRow; $rowNumber++) {
        $record = [];

        foreach (gemarc_expected_headers() as $requiredHeader) {
            $columnIndex = $headerMap[gemarc_normalize_header($requiredHeader)];
            $cell = $sheet->getCellByColumnAndRow($columnIndex, $rowNumber);
            $record[gemarc_header_to_json_key($requiredHeader)] = gemarc_cell_to_string($cell);
        }

        if (trim($record['certificate_number'] ?? '') === '') {
            continue;
        }

        $records[] = $record;
    }

    return $records;
}

function gemarc_write_certificate_json(array $records, string $jsonPath): void
{
    gemarc_ensure_directory(dirname($jsonPath));

    $json = json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        throw new RuntimeException('Unable to encode certificate data as JSON.');
    }

    if (file_put_contents($jsonPath, $json . PHP_EOL, LOCK_EX) === false) {
        throw new RuntimeException('Unable to write the JSON backup file.');
    }
}

function gemarc_process_uploaded_certificate_file(string $stagedExcelPath, string $finalExcelPath, string $jsonPath): array
{
    $records = gemarc_load_certificates_from_excel($stagedExcelPath);
    gemarc_write_certificate_json($records, $jsonPath);

    if (!rename($stagedExcelPath, $finalExcelPath)) {
        if (!copy($stagedExcelPath, $finalExcelPath) || !unlink($stagedExcelPath)) {
            throw new RuntimeException('The uploaded Excel backup could not be saved.');
        }
    }

    $lastUploadDate = date('Y-m-d H:i:s', time());
    $lastUploadTimestamp = filemtime($finalExcelPath);
    if ($lastUploadTimestamp !== false) {
        $lastUploadDate = date('Y-m-d H:i:s', $lastUploadTimestamp);
    }

    return [
        'count' => count($records),
        'last_upload_date' => $lastUploadDate,
        'last_upload_filename' => basename($finalExcelPath),
        'json_path' => $jsonPath,
        'excel_path' => $finalExcelPath,
    ];
}

function gemarc_read_certificate_status(): array
{
    $jsonPath = gemarc_json_path();
    $excelPath = gemarc_excel_path();

    $count = 0;
    $jsonExists = is_file($jsonPath);
    $excelExists = is_file($excelPath);
    $lastUploadDate = null;

    if ($jsonExists) {
        $decoded = json_decode((string) file_get_contents($jsonPath), true);
        if (is_array($decoded)) {
            $count = count($decoded);
        }
    }

    if ($excelExists) {
        $timestamp = filemtime($excelPath);
        if ($timestamp !== false) {
            $lastUploadDate = date('Y-m-d H:i:s', $timestamp);
        }
    }

    return [
        'certificate_count' => $count,
        'last_upload_date' => $lastUploadDate,
        'last_uploaded_filename' => $excelExists ? basename($excelPath) : 'Certificates.xlsx',
        'json_exists' => $jsonExists,
        'excel_exists' => $excelExists,
        'json_size' => $jsonExists ? filesize($jsonPath) : 0,
    ];
}
