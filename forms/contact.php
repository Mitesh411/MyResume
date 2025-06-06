<?php
// Add rate limiting to prevent spam
session_start();
$last_submit = $_SESSION['last_submit'] ?? 0;
if (time() - $last_submit < 60) {
    http_response_code(429);
    die('Please wait before submitting again');
}
$_SESSION['last_submit'] = time();

if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
      http_response_code(403);
      die('Invalid request');
  }
  /**
  * Requires the "PHP Email Form" library
  * The "PHP Email Form" library is available only in the pro version of the template
  * The library should be uploaded to: vendor/php-email-form/php-email-form.php
  * For more info and help: https://bootstrapmade.com/php-email-form/
  */

  // Move configuration to separate file
  require_once 'config.php';
  // Replace contact@example.com with your real receiving email address
  $receiving_email_address = CONFIG['admin_email'];

  $php_email_form = '../assets/vendor/php-email-form/php-email-form.php';
  if (!is_readable($php_email_form)) {
      error_log('PHP Email Form library not found');
      http_response_code(500);
      die('Internal server error');
  }
  include($php_email_form);

  $contact = new PHP_Email_Form;
  $contact->ajax = true;
  
  // Add input validation before processing
  $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
  $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
  $subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING);
  $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);

  if (!$name || !$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
      die('Invalid input data');
  }

  $contact->to = $receiving_email_address;
  $contact->from_name = $name;
  $contact->from_email = $email;
  $contact->subject = $subject;

  // Load SMTP settings from environment or config file
  $smtp_config = [
      'host' => getenv('SMTP_HOST'),
      'username' => getenv('SMTP_USER'),
      'password' => getenv('SMTP_PASS'),
      'port' => getenv('SMTP_PORT') ?: '587',
      'encryption' => 'tls'
  ];

  if ($smtp_config['host']) {
      $contact->smtp = $smtp_config;
  }

  $contact->add_message( $_POST['name'], 'From');
  $contact->add_message( $_POST['email'], 'Email');
  $contact->add_message( $_POST['message'], 'Message', 10);

  try {
      $result = $contact->send();
      echo json_encode([
          'success' => true,
          'message' => 'Message sent successfully'
      ]);
  } catch (Exception $e) {
      http_response_code(500);
      echo json_encode([
          'success' => false,
          'message' => 'Failed to send message'
      ]);
  }
?>
