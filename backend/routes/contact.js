const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// rate limiting
const contactAttempts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const MAX_ATTEMPTS = 3;

const sendContactEmail = async (formData) => {
    console.log('Contact form submission:', {
        from: formData.email,
        name: formData.name,
        subject: formData.subject,
        message: formData.message.substring(0, 100) + '...'
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    //log email
    const emailContent = {
        to: process.env.BUSINESS_EMAIL,
        from: process.env.SES_FROM_EMAIL,
        subject: `Website Inquiry: ${formData.subject || 'General Inquiry'} - ${formData.name}`,
        html: generateEmailHTML(formData),
        text: generateEmailText(formData)
    };

    console.log('Email to send:', emailContent);
    return { success: true, messageId: '' };
};


// Generate HTML email template
const generateEmailHTML = (formData) => {
    const truckDetails = formData.truckInterest ? `
        <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                <strong>Truck Interest:</strong>
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                ${formData.truckInterest}
            </td>
        </tr>
    ` : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Website Inquiry</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #8B0000; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">New Website Inquiry</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">From BHB Truck Sales Website</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                            <strong>Name:</strong>
                        </td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                            ${formData.name}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                            <strong>Email:</strong>
                        </td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                            <a href="mailto:${formData.email}" style="color: #8B0000;">${formData.email}</a>
                        </td>
                    </tr>
                    ${formData.phone ? `
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                            <strong>Phone:</strong>
                        </td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                            <a href="tel:${formData.phone}" style="color: #8B0000;">${formData.phone}</a>
                        </td>
                    </tr>
                    ` : ''}
                    ${formData.subject ? `
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                            <strong>Subject:</strong>
                        </td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                            ${formData.subject}
                        </td>
                    </tr>
                    ` : ''}
                    ${truckDetails}
                </table>
                
                <div style="margin-top: 20px;">
                    <strong>Message:</strong>
                    <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 8px; border-left: 4px solid #8B0000;">
                        ${formData.message.replace(/\n/g, '<br>')}
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                    <p>Submitted on: ${new Date().toLocaleString()}</p>
                    <p>From: BHB Truck Sales Website Contact Form</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Generate plain text email
const generateEmailText = (formData) => {
    return `
NEW WEBSITE INQUIRY - BHB Truck Sales

Name: ${formData.name}
Email: ${formData.email}
${formData.phone ? `Phone: ${formData.phone}` : ''}
${formData.subject ? `Subject: ${formData.subject}` : ''}
${formData.truckInterest ? `Truck Interest: ${formData.truckInterest}` : ''}

Message:
${formData.message}

---
Submitted: ${new Date().toLocaleString()}
Source: BHB Truck Sales Website Contact Form
    `;
};

// Rate limiting middleware
const checkRateLimit = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Clean up old attempts
    for (const [ip, attempts] of contactAttempts.entries()) {
        const validAttempts = attempts.filter(time => now - time < RATE_LIMIT_WINDOW);
        if (validAttempts.length === 0) {
            contactAttempts.delete(ip);
        } else {
            contactAttempts.set(ip, validAttempts);
        }
    }

    // Check current IP attempts
    const attempts = contactAttempts.get(clientIP) || [];
    if (attempts.length >= MAX_ATTEMPTS) {
        return res.status(429).json({
            success: false,
            error: 'Too many contact form submissions. Please wait 15 minutes before trying again.',
            code: 'RATE_LIMITED',
            retryAfter: Math.ceil((attempts[0] + RATE_LIMIT_WINDOW - now) / 1000)
        });
    }

    // Add current attempt
    attempts.push(now);
    contactAttempts.set(clientIP, attempts);

    next();
};

// Contact form validation rules
const contactValidation = () => {
    return [
        body('name')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Name must be between 2 and 100 characters')
            .matches(/^[a-zA-Z\s\-'\.]+$/)
            .withMessage('Name contains invalid characters'),

        body('email')
            .optional()
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address')
            .isLength({ max: 254 })
            .withMessage('Email address is too long'),

        body('phone')
            .optional()
            .trim()
            .matches(/^[\+]?[\s\-\(\)]*([0-9][\s\-\(\)]*){10,14}$/)
            .withMessage('Please provide a valid phone number'),

        body('subject')
            .optional()
            .trim()
            .isLength({ max: 200 })
            .withMessage('Subject is too long'),

        body('truckInterest')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Truck interest field is too long'),

        body('message')
            .trim()
            .isLength({ min: 10, max: 2000 })
            .withMessage('Message must be between 10 and 2000 characters')
    ];
};

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        return res.status(400).json({
            success: false,
            error: firstError.msg,
            code: 'VALIDATION_ERROR',
            field: firstError.path
        });
    }

    //custom validaiton either email or phone
    const hasEmail = req.body.email && req.body.email.trim()
    const hasPhone = req.body.email && req.body.phone.trim()

    if (!hasEmail && !hasPhone) {
        return res.status(400).json({
            success: false,
            error: 'Please provide either email address or phone number',
            code: 'CONTACT_METHOD_REQUIRED',
            field: 'email_or_phone'
        });
    }
    next();
};

// POST /api/contact - Submit contact form
router.post('/',
    checkRateLimit,
    contactValidation(),
    handleValidationErrors,
    async (req, res) => {
        try {
            const { name, email, phone, subject, truckInterest, message } = req.body;

            // Sanitize input data
            const formData = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone ? phone.trim() : '',
                subject: subject ? subject.trim() : 'General Inquiry',
                truckInterest: truckInterest ? truckInterest.trim() : '',
                message: message.trim()
            };

            // Log the submission for audit
            console.log(`📋 Contact form submission from ${formData.email} (${req.ip})`);

            // Send email
            const emailResult = await sendContactEmail(formData);

            if (emailResult.success) {
                // Log successful submission
                console.log(`✅ Contact email sent successfully. MessageId: ${emailResult.messageId}`);

                res.json({
                    success: true,
                    message: 'Your message has been sent successfully. We\'ll get back to you within 24 hours.',
                    timestamp: new Date().toISOString()
                });
            } else {
                console.error('❌ Failed to send contact email:', emailResult.error);

                res.status(500).json({
                    success: false,
                    error: 'Failed to send your message. Please try calling us directly.',
                    code: 'EMAIL_SEND_FAILED'
                });
            }

        } catch (error) {
            console.error('❌ Contact form error:', error);

            res.status(500).json({
                success: false,
                error: 'An unexpected error occurred. Please try again or call us directly.',
                code: 'INTERNAL_ERROR'
            });
        }
    }
);

// GET /api/contact/status - Check if contact form is working
router.get('/status', (req, res) => {
    res.json({
        success: true,
        status: 'Contact form is operational',
        email: {
            configured: !!process.env.BUSINESS_EMAIL,
            sesReady: !!process.env.AWS_ACCESS_KEY_ID
        },
        rateLimit: {
            window: RATE_LIMIT_WINDOW,
            maxAttempts: MAX_ATTEMPTS
        }
    });
});

module.exports = router;