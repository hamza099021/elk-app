import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@elkai.cloud';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Elk AI';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    await sgMail.send({
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });
    
    console.log(`Email sent successfully to ${to}`);
    return { success: true };
  } catch (error: any) {
    console.error('SendGrid error:', error.response?.body || error);
    return { success: false, error: error.message };
  }
}

export async function sendWelcomeEmail(email: string, firstName: string) {
  const subject = 'Welcome to Elk AI! 🎉';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Elk AI!</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>Thank you for joining Elk AI! Your account has been successfully created.</p>
          
          <p>You're now on the <strong>Free Plan</strong> with:</p>
          <ul>
            <li>✅ 10 Screen Q&A queries</li>
            <li>✅ 20 minutes of audio processing</li>
            <li>✅ Access to core AI features</li>
          </ul>
          
          <p>Ready to get started?</p>
          <a href="https://elkai.cloud" class="button">Go to Dashboard</a>
          
          <p>Need more? Upgrade to <strong>Pro</strong> for unlimited access!</p>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
          
          <p>Best regards,<br>The Elk AI Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Elk AI. All rights reserved.</p>
          <p>You received this email because you signed up for Elk AI.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({ to: email, subject, html });
}

export async function sendPasswordSetupEmail(email: string, token: string) {
  const setupUrl = `https://elkai.cloud/setup-password?token=${token}`;
  const subject = 'Complete Your Elk AI Pro Account Setup 🚀';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Elk AI Pro!</h1>
        </div>
        <div class="content">
          <h2>Your subscription is active!</h2>
          <p>Thank you for subscribing to Elk AI Pro. Your payment has been processed successfully.</p>
          
          <div class="alert">
            <strong>⚠️ Action Required:</strong> Please set up your password to complete your account setup.
          </div>
          
          <p>Your Pro account includes:</p>
          <ul>
            <li>✅ 900 Screen Q&A queries per month</li>
            <li>✅ 600 minutes of audio processing</li>
            <li>✅ 100 web search queries</li>
            <li>✅ Priority support</li>
            <li>✅ Advanced AI features</li>
          </ul>
          
          <p>Click the button below to set up your password:</p>
          <a href="${setupUrl}" class="button">Set Up Password</a>
          
          <p><small>Or copy this link: ${setupUrl}</small></p>
          
          <p><strong>Note:</strong> This link expires in 24 hours.</p>
          
          <p>Your email: <strong>${email}</strong></p>
          
          <p>Best regards,<br>The Elk AI Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Elk AI. All rights reserved.</p>
          <p>You received this email because you subscribed to Elk AI Pro.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({ to: email, subject, html });
}
