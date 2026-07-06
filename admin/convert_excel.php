<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/certificate_tools.php';

function gemarc_convert_certificate_upload(string $stagedExcelPath, string $finalExcelPath, string $jsonPath): array
{
    return gemarc_process_uploaded_certificate_file($stagedExcelPath, $finalExcelPath, $jsonPath);
}
