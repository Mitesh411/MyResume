<?php
// --- New contact.php using PHPMailer ---

// Import PHPMailer classes into the global namespace
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
 
// Include Mail configuratin file
$config = require 'config.php';

// Load PHPMailer files
require '../assets/vendor/PHPMailer/Exception.php';
require '../assets/vendor/PHPMailer/PHPMailer.php';
require '../assets/vendor/PHPMailer/SMTP.php';

// Sanitize user input
$name    = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
$email   = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
$subject = filter_var($_POST['subject'], FILTER_SANITIZE_STRING);
$message = filter_var($_POST['message'], FILTER_SANITIZE_STRING);

// Create an instance of PHPMailer; passing `true` enables exceptions
$mail = new PHPMailer(true);

try {
    // --- Server settings ---
    $mail->SMTPDebug = SMTP::DEBUG_OFF; // Change to SMTP::DEBUG_SERVER for detailed debugging output
    $mail->isSMTP();
    $mail->Host       = $config['smtp_host'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $config['smtp_user'];
    $mail->Password   = $config['smtp_pass'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $config['smtp_port'];

    // --- Recipients ---
    $mail->setFrom($email, $name); // Sender's email and name
    $mail->addAddress($config['your_email_address'], 'Mitesh Dandade'); // Recipient's email and name
    $mail->addReplyTo($email, $name);

    // --- Content ---
    $mail->isHTML(true);
    // Prepare the HTML email body
    $htmlBody = <<<HTML
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid #dddddd;
                }
                .header {
                    background-color: #007bff;
                    color: #ffffff;
                    padding: 20px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 30px;
                    line-height: 1.6;
                    color: #333333;
                }
                .content table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .content td {
                    padding: 10px 0;
                    border-bottom: 1px solid #eeeeee;
                }
                .content .label {
                    font-weight: bold;
                    width: 100px;
                    color: #555555;
                }
                .footer {
                    background-color: #f4f4f4;
                    color: #888888;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Form Submission</h1>
                </div>
                <div class="content">
                    <p>You have received a new message from your portfolio contact form.</p>
                    <table>
                        <tr>
                            <td class="label">Name:</td>
                            <td>$name</td>
                        </tr>
                        <tr>
                            <td class="label">Email:</td>
                            <td><a href="mailto:$email">$email</a></td>
                        </tr>
                        <tr>
                            <td class="label">Subject:</td>
                            <td>$subject</td>
                        </tr>
                        <tr>
                            <td class="label" style="vertical-align: top;">Message:</td>
                            <td>
                                __MESSAGE_BODY__
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="footer">
                    <p>This email was sent from your portfolio website.</p>
                </div>
            </div>
        </body>
        </html>
    HTML;
    $formattedMessage = nl2br(htmlspecialchars($message));
    // Replace placeholders with sanitized variables
    $htmlBody = str_replace(
        ['$name', '$email', '$subject', '__MESSAGE_BODY__'],
        [
            htmlspecialchars($name),
            htmlspecialchars($email),
            htmlspecialchars($subject),
            $formattedMessage,
        ],
        $htmlBody
    );
    $mail->Body = $htmlBody;
    $mail->Subject = 'New Contact Form Submission: ' . $subject;
    $mail->AltBody = "You have received a new message.\n\n" .
                     "From: " . $name . " (" . $email . ")\n" .
                     "Subject: " . $subject . "\n" .
                     "Message:\n" . $message;

    // Send the email
    $mail->send();
    
    // --- Send Success JSON Response ---
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'message' => 'Your message has been sent. Thank you!']);

} catch (Exception $e) {
    // --- Send Error JSON Response ---
    header('Content-Type: application/json');
    http_response_code(500);
    // For extra security, you might not want to show the detailed error to the user.
    // But for debugging, it's very helpful.
    echo json_encode(['success' => false, 'message' => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
}

?>