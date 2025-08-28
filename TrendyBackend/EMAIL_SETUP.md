# Email Setup Guide - Gmail with App Password

This guide will help you set up email functionality using Gmail with App Password authentication.

## Prerequisites

1. A Gmail account
2. 2-Factor Authentication enabled on your Gmail account

## Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security"
3. Enable "2-Step Verification" if not already enabled

## Step 2: Generate App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security"
3. Under "2-Step Verification", click on "App passwords"
4. Select "Mail" as the app and "Other" as the device
5. Click "Generate"
6. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

## Step 3: Configure Environment Variables

Add these variables to your `.env` file:

```env
# Email Configuration
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-digit-app-password
ADMIN_EMAIL=admin@yourdomain.com  # Optional, defaults to EMAIL_USER
```

### Example:

```env
EMAIL_USER=mybusiness@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
ADMIN_EMAIL=admin@gettrendy.com
```

## Step 4: Test Email Functionality

The email service will automatically handle:

- ✅ Order confirmation emails to customers
- ✅ Order notifications to admin
- ✅ Password reset OTP emails
- ✅ Contact form notifications

## Troubleshooting

### Common Issues:

1. **"Invalid login" error**

   - Make sure you're using the App Password, not your regular Gmail password
   - Ensure 2-Factor Authentication is enabled

2. **"Less secure app access" error**

   - App Passwords bypass this restriction, so this shouldn't occur
   - Double-check you're using the correct App Password

3. **Emails going to spam**
   - Consider setting up SPF/DKIM records for your domain
   - Use a business email domain instead of Gmail for production

### Gmail Daily Limits:

- Free Gmail: ~500 emails per day
- Gmail Workspace: ~2000 emails per day

## Security Notes

- ✅ App Passwords are secure and can be revoked individually
- ✅ Never commit your `.env` file to version control
- ✅ Use different App Passwords for different environments (dev/prod)

## Alternative Email Providers

If you need higher email limits or better deliverability:

1. **SendGrid** - 100 emails/day free, then paid
2. **Mailgun** - 5,000 emails/month free
3. **Amazon SES** - Very cost-effective for high volume

## Support

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify your environment variables are correctly set
3. Test with a simple email first before using in production
