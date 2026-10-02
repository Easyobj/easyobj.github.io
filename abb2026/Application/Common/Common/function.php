<?php

function h($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function abbAdminRedirect(string $type, string $message): void
{
    $_SESSION['admin_flash'] = ['type' => $type, 'message' => $message];
    header('Location: index.php?m=Admin&c=Index&a=index', true, 303);
    exit;
}

function abbCsvCell($value): string
{
    $text = (string) $value;
    if (preg_match('/^[\x00-\x20]*[=+@-]/u', $text) || preg_match('/^[\t\r\n]/', $text)) {
        return "'" . $text;
    }
    return $text;
}
