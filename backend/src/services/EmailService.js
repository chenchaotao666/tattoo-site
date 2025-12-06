const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        try {
            // 检查是否有必需的SMTP配置
            if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
                console.warn('⚠️ SMTP credentials not configured. Email service will not be functional.');
                console.warn('Please set SMTP_USER and SMTP_PASS environment variables.');
                this.transporter = null;
                return;
            }

            // 配置邮件传输器
            this.transporter = nodemailer.createTransporter({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: process.env.SMTP_PORT || 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            console.log('✅ Email service initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize email service:', error.message);
            this.transporter = null;
        }
    }

    // 发送密码重置邮件
    async sendPasswordResetEmail(email, resetToken, username) {
        try {
            if (!this.transporter) {
                console.warn(`⚠️ Email service not configured. Would send password reset email to ${email}`);
                console.warn(`Reset token: ${resetToken}`);
                // 返回模拟成功结果用于测试
                return {
                    success: true,
                    messageId: 'mock-message-id-' + Date.now(),
                    note: 'Email service not configured - this is a mock response'
                };
            }

            if (!email || !resetToken) {
                throw new Error('Email and reset token are required');
            }

            // 构建重置密码的URL
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3010';
            const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

            // 邮件内容
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>重置密码 - AI Tattoo</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 20px;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-align: center;
                            padding: 30px 20px;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                            font-weight: 300;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .content h2 {
                            color: #333;
                            margin-bottom: 20px;
                            font-size: 24px;
                        }
                        .content p {
                            margin-bottom: 20px;
                            font-size: 16px;
                            line-height: 1.8;
                        }
                        .reset-button {
                            display: inline-block;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-decoration: none;
                            padding: 15px 30px;
                            border-radius: 25px;
                            font-weight: bold;
                            font-size: 16px;
                            margin: 20px 0;
                            transition: transform 0.2s;
                        }
                        .reset-button:hover {
                            transform: translateY(-2px);
                        }
                        .token-info {
                            background-color: #f8f9fa;
                            border-left: 4px solid #667eea;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .footer {
                            background-color: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            border-top: 1px solid #e9ecef;
                        }
                        .footer p {
                            margin: 0;
                            color: #6c757d;
                            font-size: 14px;
                        }
                        .warning {
                            color: #dc3545;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎨 AI Tattoo</h1>
                        </div>
                        <div class="content">
                            <h2>密码重置请求</h2>
                            <p>您好${username ? ` ${username}` : ''}，</p>
                            <p>我们收到了重置您账户密码的请求。如果这是您本人的操作，请点击下方按钮重置密码：</p>

                            <div style="text-align: center;">
                                <a href="${resetUrl}" class="reset-button">重置密码</a>
                            </div>

                            <div class="token-info">
                                <p><strong>重要提醒：</strong></p>
                                <ul>
                                    <li>此链接将在 <span class="warning">1小时</span> 后失效</li>
                                    <li>出于安全考虑，此链接只能使用一次</li>
                                    <li>如果您没有请求重置密码，请忽略此邮件</li>
                                </ul>
                            </div>

                            <p>如果按钮无法点击，您也可以复制以下链接到浏览器地址栏：</p>
                            <p style="word-break: break-all; color: #667eea; font-family: monospace; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
                                ${resetUrl}
                            </p>

                            <p>如果您有任何疑问，请联系我们的客服团队。</p>
                        </div>
                        <div class="footer">
                            <p>© 2024 AI Tattoo. 此邮件由系统自动发送，请勿回复。</p>
                            <p>如需帮助，请访问我们的网站或联系客服。</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // 纯文本版本（备用）
            const textContent = `
                AI Tattoo - 密码重置请求

                您好${username ? ` ${username}` : ''}，

                我们收到了重置您账户密码的请求。如果这是您本人的操作，请访问以下链接重置密码：

                ${resetUrl}

                重要提醒：
                - 此链接将在 1小时 后失效
                - 出于安全考虑，此链接只能使用一次
                - 如果您没有请求重置密码，请忽略此邮件

                如果您有任何疑问，请联系我们的客服团队。

                © 2025 AI Tattoo
                此邮件由系统自动发送，请勿回复。
            `;

            const mailOptions = {
                from: {
                    name: 'AI Tattoo',
                    address: process.env.SMTP_USER
                },
                to: email,
                subject: '🔒 重置您的AI Tattoo账户密码',
                html: htmlContent,
                text: textContent
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Password reset email sent to ${email}:`, result.messageId);

            return {
                success: true,
                messageId: result.messageId
            };

        } catch (error) {
            console.error('❌ Failed to send password reset email:', error.message);
            throw new Error(`Failed to send password reset email: ${error.message}`);
        }
    }

    // 验证邮件服务配置
    async verifyConnection() {
        try {
            if (!this.transporter) {
                throw new Error('Email service not initialized');
            }

            await this.transporter.verify();
            console.log('✅ Email service connection verified');
            return true;
        } catch (error) {
            console.error('❌ Email service verification failed:', error.message);
            return false;
        }
    }

    // 发送测试邮件
    async sendTestEmail(email) {
        try {
            const mailOptions = {
                from: {
                    name: 'AI Tattoo',
                    address: process.env.SMTP_USER
                },
                to: email,
                subject: '测试邮件 - AI Tattoo',
                html: `
                    <h2>邮件服务测试成功！</h2>
                    <p>如果您收到这封邮件，说明AI Tattoo的邮件服务配置正确。</p>
                    <p>发送时间：${new Date().toLocaleString()}</p>
                `,
                text: `邮件服务测试成功！如果您收到这封邮件，说明AI Tattoo的邮件服务配置正确。发送时间：${new Date().toLocaleString()}`
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Test email sent to ${email}:`, result.messageId);

            return {
                success: true,
                messageId: result.messageId
            };

        } catch (error) {
            console.error('❌ Failed to send test email:', error.message);
            throw new Error(`Failed to send test email: ${error.message}`);
        }
    }
}

module.exports = EmailService;