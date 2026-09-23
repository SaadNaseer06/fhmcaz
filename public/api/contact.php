<?php
/**
 * Secure contact / appointment form handler for the static Astro site.
 * Deployed to /fhmcaz/api/contact.php
 */
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit('Method Not Allowed');
}

// Basic rate limit by IP (file-based)
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'fhmcaz_form_rate';
if (!is_dir($rateDir)) {
    @mkdir($rateDir, 0700, true);
}
$rateFile = $rateDir . DIRECTORY_SEPARATOR . hash('sha256', $ip) . '.json';
$now = time();
$window = 600; // 10 minutes
$maxHits = 8;
$hits = [];
if (is_file($rateFile)) {
    $hits = json_decode((string) file_get_contents($rateFile), true) ?: [];
    $hits = array_values(array_filter($hits, static fn ($t) => is_int($t) && ($now - $t) < $window));
}
if (count($hits) >= $maxHits) {
    http_response_code(429);
    exit('Too many requests. Please try again later.');
}
$hits[] = $now;
file_put_contents($rateFile, json_encode($hits), LOCK_EX);

// Honeypot
if (!empty($_POST['company'] ?? '')) {
    http_response_code(200);
    exit('OK');
}

function field(string $key, int $max): string
{
    $v = trim((string) ($_POST[$key] ?? ''));
    $v = strip_tags($v);
    if (strlen($v) > $max) {
        $v = substr($v, 0, $max);
    }
    return $v;
}

$name = field('name', 120);
$email = field('email', 160);
$phone = field('phone', 30);
$message = field('message', 2000);
$formType = field('form_type', 40);
$visitType = field('visit_type', 120);

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    exit('Please provide a valid name, email, and message.');
}

$to = 'info@fhmcaz.com';
$subject = ($formType === 'appointment' ? 'Appointment request' : 'Contact form') . ' — FHMC AZ';
$body = "Name: {$name}\nEmail: {$email}\nPhone: {$phone}\n";
if ($visitType !== '') {
    $body .= "Visit type: {$visitType}\n";
}
$body .= "Type: {$formType}\nIP: {$ip}\n\nMessage:\n{$message}\n";

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: FHMC Website <noreply@fhmcaz.local>',
    'Reply-To: ' . $email,
    'X-Mailer: FHMC-Static-Form',
];

$ok = @mail($to, $subject, $body, implode("\r\n", $headers));

// Always log locally for XAMPP (mail often not configured)
$logDir = __DIR__ . DIRECTORY_SEPARATOR . 'submissions';
if (!is_dir($logDir)) {
    @mkdir($logDir, 0750, true);
}
@file_put_contents(
    $logDir . DIRECTORY_SEPARATOR . date('Y-m-d_His') . '_' . bin2hex(random_bytes(4)) . '.txt',
    $body,
    LOCK_EX
);

$base = '/fhmcaz/';
$redirect = $base . 'contact-us/?sent=' . ($ok ? '1' : '0');
if ($formType === 'appointment') {
    $redirect = $base . 'book-appointments/?sent=' . ($ok ? '1' : '0');
}
header('Location: ' . $redirect, true, 303);
exit;
