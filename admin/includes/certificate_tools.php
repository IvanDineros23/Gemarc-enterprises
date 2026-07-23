<?php
declare(strict_types=1);

use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

function gemarc_admin_dir(): string
{
    return dirname(__DIR__, 2);
}

function gemarc_includes_dir(): string
{
    return gemarc_admin_dir() . DIRECTORY_SEPARATOR . 'admin';
}

function gemarc_data_dir(): string
{
    return gemarc_admin_dir() . DIRECTORY_SEPARATOR . 'data';
}

function gemarc_uploads_dir(): string
{
    return gemarc_admin_dir() . DIRECTORY_SEPARATOR . 'uploads';
}

function gemarc_json_path(): string
{
    return gemarc_data_dir() . DIRECTORY_SEPARATOR . 'certificates.json';
}

function gemarc_upload_metadata_path(): string
{
    return gemarc_data_dir() . DIRECTORY_SEPARATOR . 'upload_metadata.json';
}

function gemarc_excel_path(?string $filename = null): string
{
    if ($filename === null || trim($filename) === '') {
        $filename = 'Certificates.xlsx';
    }

    return gemarc_uploads_dir()
        . DIRECTORY_SEPARATOR
        . basename($filename);
}

function gemarc_staging_excel_path(): string
{
   return gemarc_uploads_dir() . DIRECTORY_SEPARATOR . 'certificate_upload.tmp';
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

    $autoload = dirname(__DIR__) . '/vendor/autoload.php';

    if (!file_exists($autoload)) {
        throw new RuntimeException(
            'Composer autoload not found: ' . $autoload
        );
    }

    require_once $autoload;

    if (!class_exists(\PhpOffice\PhpSpreadsheet\IOFactory::class)) {
        throw new RuntimeException(
            'PhpSpreadsheet failed to load after requiring autoload.php'
        );
    }

    $booted = true;
}

function gemarc_normalize_header(string $header): string
{
    $header = strtolower(trim($header));

    $normalized = preg_replace('/[^a-z0-9]+/', '_', $header);

    if ($normalized === null) {
        return '';
    }

    return trim($normalized, '_');
}

function gemarc_expected_headers(): array
{
   return [
    'CERTIFICATE CONTROL NO.',
    'CUSTOMER NAME',
    'MACHINE TYPE',
    'SERIAL NO.',
    'DATE OF CALIBRATION',
    'VALIDITY',
    'CALIBRATED BY',
    ];
}

function gemarc_required_header_aliases(): array
{
   return [

           'certificate_number' => [
            'certificate_control_no',
            'certificate control no',
            'certificate_control_number',
        
            'certificate_no',
            'certificate no'
            ],
            
            'customer' => [
            'customer_name',
            'customer name'
              ],
            
            'equipment' => [
                'machine_type',
                'machine type'
            ],
            
            'serial_number' => [
                'serial_no',
                'serial no',
            
                'serial_number',
                'serial number'
            ],
            
            'calibration_date' => [
                'date_of_calibration',
                'date of calibration'
            ],
            
            'expiry_date' => [
                'validity'
            ],
            'issued_by' => [
                'calibrated_by',
                'calibrated by'
            ],

        ];
}

function gemarc_training_header_aliases(): array
{
   return [
        'certificate_number' => [
            'certificate_number',
            'certificate number',
            'cert no'
        ],
        'participant_name' => [
            'participant_name',
            'participant name',
            'name'
        ],
        'customer' => [
            'customer_name',
            'customer name',
            'customer'
        ],
        'training_date' => [
            'training_date',
            'training date'
        ],
        'status' => [
            'status'
        ]
    ];
}

function gemarc_header_to_json_key(string $header): string
{
    $normalized = gemarc_normalize_header($header);

    $map = [
        'certificate_control_no' => 'certificate_number',
        'certificate_no'         => 'certificate_number',
        'customer_name'          => 'customer',
        'machine_type'           => 'equipment',
        'serial_no'              => 'serial_number',
        'date_of_calibration'    => 'calibration_date',
        'validity'               => 'expiry_date',
        'calibrated_by'          => 'issued_by',
        
        // --- para sa training certificates---
        'participant_name'       => 'participant_name',
        'name'                   => 'participant_name',
        'training_date'          => 'training_date'
    ];

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

function gemarc_read_json_records(string $jsonPath): array
{
    if (!is_file($jsonPath)) {
        return [];
    }

    $decoded = json_decode((string) file_get_contents($jsonPath), true);
    if (!is_array($decoded)) {
        return [];
    }

    $records = [];
    foreach ($decoded as $record) {
        if (is_array($record)) {
            $records[] = $record;
        }
    }

    return $records;
}

function gemarc_normalize_certificate_record(array $record): array
{
    $normalized = [];

    foreach ($record as $key => $value) {
        $key = (string) $key;
        $jsonKey = gemarc_header_to_json_key($key);
        $textValue = is_scalar($value) || $value === null ? trim((string) $value) : (string) json_encode($value);

        if ($jsonKey === 'status') {
            $textValue = strtoupper($textValue);
        }

        $normalized[$jsonKey] = $textValue;
    }

    ksort($normalized);

    return $normalized;
}

function gemarc_certificate_signature(array $record): string
{
    return md5(json_encode(gemarc_normalize_certificate_record($record), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?: '');
}

function gemarc_certificate_number_key(array $record): string
{
    return strtoupper(trim((string) ($record['certificate_number'] ?? '')));
}

function gemarc_build_certificate_diff(array $oldRecords, array $newRecords): array
{
    $oldIndex = [];
    foreach ($oldRecords as $record) {
        if (!is_array($record)) {
            continue;
        }

        $key = gemarc_certificate_number_key($record);
        if ($key === '') {
            continue;
        }

        $oldIndex[$key] = $record;
    }

    $newIndex = [];
    foreach ($newRecords as $record) {
        if (!is_array($record)) {
            continue;
        }

        $key = gemarc_certificate_number_key($record);
        if ($key === '') {
            continue;
        }

        $newIndex[$key] = $record;
    }

    $added = [];
    $updated = [];
    $removed = [];

    foreach ($newIndex as $certificateNumber => $record) {
        if (!isset($oldIndex[$certificateNumber])) {
            $added[] = $certificateNumber;
            continue;
        }

        if (gemarc_certificate_signature($oldIndex[$certificateNumber]) !== gemarc_certificate_signature($record)) {
            $updated[] = $certificateNumber;
        }
    }

    foreach ($oldIndex as $certificateNumber => $record) {
        if (!isset($newIndex[$certificateNumber])) {
            $removed[] = $certificateNumber;
        }
    }

    return [
        'added' => array_values($added),
        'updated' => array_values($updated),
        'removed' => array_values($removed),
        'added_count' => count($added),
        'updated_count' => count($updated),
        'removed_count' => count($removed),
    ];
}

function gemarc_read_upload_metadata(): array
{
    $path = gemarc_upload_metadata_path();
    if (!is_file($path)) {
        return [
            'history' => [],
        ];
    }

    $decoded = json_decode((string) file_get_contents($path), true);
    if (!is_array($decoded)) {
        return [
            'history' => [],
        ];
    }

    if (!isset($decoded['history']) || !is_array($decoded['history'])) {
        $decoded['history'] = [];
    }

    return $decoded;
}

function gemarc_write_upload_metadata(array $metadata, ?string $metadataPath = null): void
{
    $metadataPath = $metadataPath ?? gemarc_upload_metadata_path();
    gemarc_ensure_directory(dirname($metadataPath));

    $json = json_encode($metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        throw new RuntimeException('Unable to encode upload metadata.');
    }

    if (file_put_contents($metadataPath, $json . PHP_EOL, LOCK_EX) === false) {
        throw new RuntimeException('Unable to write the upload metadata file.');
    }
}

function gemarc_append_upload_history(array $metadata, array $entry, int $limit = 10): array
{
    $history = $metadata['history'] ?? [];
    if (!is_array($history)) {
        $history = [];
    }

    array_unshift($history, $entry);
    $history = array_slice($history, 0, max(1, $limit));

    $metadata['history'] = $history;
    $metadata['last_upload'] = $entry;

    return $metadata;
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
    
    // Arrays para sa lahat ng data mula sa lahat ng tabs
    $records = [];
    $seenCertificateNumbers = [];
    $sheetsProcessed = 0;

    // Iikot natin sa LAHAT ng tabs na nasa loob ng Excel file
    foreach ($spreadsheet->getAllSheets() as $sheet) {
        $highestRow = (int) $sheet->getHighestDataRow();
        $highestColumn = (string) $sheet->getHighestDataColumn();

        /*
        |--------------------------------------------------------------------------
        | Automatically detect the header row and determine Certificate Type
        |--------------------------------------------------------------------------
        */
        $headerRowNumber = null;
        $headerRow = [];
        $sheetType = 'calibration'; // Default type

        $calibAliases = gemarc_required_header_aliases()['certificate_number'];
        $trainingAliases = gemarc_training_header_aliases()['certificate_number'];
        $allCertAliases = array_unique(array_merge($calibAliases, $trainingAliases));
        $participantAliases = gemarc_training_header_aliases()['participant_name'];

        for ($row = 1; $row <= min($highestRow, 30); $row++) {
            $currentRow = $sheet->rangeToArray(
                'A' . $row . ':' . $highestColumn . $row,
                null,
                true,
                false
            )[0] ?? [];

            $hasCertColumn = false;
            $hasParticipantColumn = false;

            foreach ($currentRow as $cell) {
                $normalized = gemarc_normalize_header((string) $cell);

                if (in_array($normalized, $allCertAliases, true)) {
                    $hasCertColumn = true;
                }
                if (in_array($normalized, $participantAliases, true)) {
                    $hasParticipantColumn = true;
                }
            }

            if ($hasCertColumn) {
                $headerRowNumber = $row;
                $headerRow = $currentRow;
                // Kapag may Participant column, Training Data ito
                if ($hasParticipantColumn) {
                    $sheetType = 'training';
                }
                break;
            }
        }

        // Kung walang nahanap na header sa tab na ito, i-skip at pumunta sa next tab
        if ($headerRowNumber === null) {
            continue;
        }

        $sheetsProcessed++;
        $headerMap = [];

        foreach ($headerRow as $index => $rawHeader) {
            $normalized = gemarc_normalize_header((string) $rawHeader);
            if ($normalized !== '') {
                $headerMap[$normalized] = $index + 1;
            }
        }

        // Gamitin ang tamang required columns depende sa type ng sheet
        $requiredAliases = $sheetType === 'training' 
            ? gemarc_training_header_aliases() 
            : gemarc_required_header_aliases();

        $missingHeaders = [];

        foreach ($requiredAliases as $field => $aliases) {
            $found = false;
            foreach ($aliases as $alias) {
                if (isset($headerMap[$alias])) {
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $missingHeaders[] = gemarc_header_label_from_key($field);
            }
        }

        if ($missingHeaders !== []) {
            throw new InvalidArgumentException(
                'Missing required column(s) in sheet "' . $sheet->getTitle() . '": ' . implode(', ', $missingHeaders)
            );
        }

        for ($rowNumber = $headerRowNumber + 1; $rowNumber <= $highestRow; $rowNumber++) {
            $record = [];

            for ($columnIndex = 1; $columnIndex <= count($headerRow); $columnIndex++) {
                $rawHeader = (string) ($headerRow[$columnIndex - 1] ?? '');

                if (trim($rawHeader) === '') {
                    continue;
                }

                $cell = $sheet->getCellByColumnAndRow($columnIndex, $rowNumber);
                $value = gemarc_cell_to_string($cell);

                if ($value === '') {
                    continue;
                }

                $record[gemarc_header_to_json_key($rawHeader)] = $value;
            }
            
            if (trim($record['certificate_number'] ?? '') === '') {
                continue;
            }

            $record['certificate_number'] = strtoupper(trim((string) $record['certificate_number']));

            // Status Logic
            if (empty($record['expiry_date'])) {
                if (!isset($record['status']) || trim($record['status']) === '') {
                    $record['status'] = 'VALID';
                }
            } else {
                $expiry = strtotime($record['expiry_date']);
                if ($expiry === false) {
                    $record['status'] = 'VALID';
                } else {
                    $record['status'] = $expiry >= time()
                        ? 'VALID'
                        : 'EXPIRED';
                }
            }

            $certificateNumber = gemarc_certificate_number_key($record);

            if (isset($seenCertificateNumbers[$certificateNumber])) {
                throw new InvalidArgumentException(
                    'Duplicate Certificate Number found: ' . $certificateNumber . ' in sheet "' . $sheet->getTitle() . '"'
                );
            }

            $seenCertificateNumbers[$certificateNumber] = true;
            $records[] = $record;
        }
    }

    if ($sheetsProcessed === 0 || $records === []) {
        throw new InvalidArgumentException(
            'The workbook does not contain any valid certificate rows in any of its tabs. Please check your columns.'
        );
    }

    return $records;
}

function gemarc_header_label_from_key(string $key): string
{
    return match ($key) {
        'certificate_number' => 'Certificate Number',
        'customer' => 'Customer',
        'equipment' => 'Equipment',
        'serial_number' => 'Serial Number',
        'calibration_date' => 'Calibration Date',
        'expiry_date' => 'Expiry Date',
        'status' => 'Status',
        
        // --- para sa training certificates ---
        'participant_name' => 'Participant Name',
        'training_date' => 'Training Date',
        
        default => ucfirst(str_replace('_', ' ', $key)),
    };
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

function gemarc_process_uploaded_certificate_file(string $stagedExcelPath, string $finalExcelPath, string $jsonPath, ?string $metadataPath = null, ?string $uploader = null): array
{
    $metadataPath = $metadataPath ?? gemarc_upload_metadata_path();
    $previousRecords = gemarc_read_json_records($jsonPath);
    $records = gemarc_load_certificates_from_excel($stagedExcelPath);
    $diff = gemarc_build_certificate_diff($previousRecords, $records);
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

    $size = is_file($jsonPath) ? (int) filesize($jsonPath) : 0;
    $metadata = gemarc_read_upload_metadata();
    $metadataEntry = [
        'last_upload_date' => $lastUploadDate,
        'uploaded_filename' => basename($finalExcelPath),
        'certificate_count' => count($records),
        'json_size' => $size,
        'uploader' => trim((string) ($uploader ?? 'Unknown')) !== '' ? trim((string) $uploader) : 'Unknown',
        'diff' => $diff,
    ];

    $metadata = gemarc_append_upload_history($metadata, $metadataEntry, 10);
    gemarc_write_upload_metadata($metadata, $metadataPath);

    return [
        'count' => count($records),
        'last_upload_date' => $lastUploadDate,
        'last_upload_filename' => basename($finalExcelPath),
        'json_path' => $jsonPath,
        'excel_path' => $finalExcelPath,
        'metadata_path' => $metadataPath,
        'metadata' => $metadata,
        'diff' => $diff,
    ];
}

function gemarc_read_certificate_status(): array
{
    $jsonPath = gemarc_json_path();
   $metadata = gemarc_read_upload_metadata();

    $uploadedFilename = $metadata['last_upload']['uploaded_filename'] ?? '';
    
    $excelPath = $uploadedFilename !== ''
        ? gemarc_uploads_dir() . DIRECTORY_SEPARATOR . $uploadedFilename
        : gemarc_excel_path();

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
        'last_uploaded_filename' => $excelExists
            ? basename($excelPath)
            : '',
        'json_exists' => $jsonExists,
        'excel_exists' => $excelExists,
        'json_size' => $jsonExists ? filesize($jsonPath) : 0,
        'metadata' => $metadata,
    ];
}
