const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/contact/send
router.post('/send', async (req, res) => {
    const { firstName, lastName, email, subject, message } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'info@archerycoaching.in', // Recipient email as requested
            subject: `New Contact Inquiry: ${subject}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                        .header { background-color: #111827; padding: 24px; text-align: center; }
                        .logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-decoration: none; }
                        .logo span { color: #ef4444; }
                        .content { padding: 32px; }
                        .title { color: #111827; margin-top: 0; margin-bottom: 24px; font-size: 20px; border-bottom: 2px solid #ef4444; display: inline-block; padding-bottom: 8px; }
                        .field { margin-bottom: 16px; }
                        .label { font-weight: 600; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; display: block; }
                        .value { color: #111827; font-size: 16px; font-weight: 500; }
                        .message-box { background-color: #f9fafb; border-left: 4px solid #ef4444; padding: 16px; margin-top: 24px; border-radius: 4px; }
                        .footer { background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af; }
                    </style>
                </head>
                <body>
                    <div style="background-color: #f4f4f4; padding: 40px 0;">
                        <div class="container">
                            <div class="header">
                                <div class="logo">ARCHERY<span>PRO</span></div>
                            </div>
                            <div class="content">
                                <h2 class="title">New Inquiry Received</h2>
                                
                                <div class="field">
                                    <span class="label">From</span>
                                    <div class="value">${firstName} ${lastName}</div>
                                </div>
                                
                                <div class="field">
                                    <span class="label">Email Address</span>
                                    <div class="value"><a href="mailto:${email}" style="color: #ef4444; text-decoration: none;">${email}</a></div>
                                </div>
                                
                                <div class="field">
                                    <span class="label">Subject</span>
                                    <div class="value">${subject}</div>
                                </div>
                                
                                <div class="message-box">
                                    <span class="label" style="margin-bottom: 8px;">Message</span>
                                    <div style="white-space: pre-line; color: #374151;">${message}</div>
                                </div>
                            </div>
                            <div class="footer">
                                <p>&copy; ${new Date().getFullYear()} Archery Pro Academy. All rights reserved.</p>
                                <p>This email was sent from the website contact form.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email' });
    }
});

module.exports = router;
