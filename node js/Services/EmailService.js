const nodemailer = require('nodemailer');
const { emailConfig } = require('./Configs/Config.js');


class EmailServerConnection {
    constructor() {

        // Create a transporter for sending emails using Gmail
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailConfig.EMAIL_SENDER,
                pass: emailConfig.APP_PASSWORD
            },
        });
    }

    async sendEmail(to, subject, content) {
        try {
            // Send email using the transporter
            await this.transporter.sendMail({
                from: emailConfig.EMAIL_SENDER,
                to,
                subject,
                text: content,
            });

            console.log(`Email sent to ${to} with subject: ${subject}\nContent:\n${content}`);
        } catch (error) {
            console.error('Error sending email:', error.message);
            throw error;
        }
    }
}

module.exports = { EmailServerConnection };