const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendAdoptionStatusEmail = async (adoptionRequest, status) => {
    try {
        const statusMessages = {
            approved: {
                subject: 'Congratulations! Your adoption request has been approved',
                text: `
Dear ${adoptionRequest.firstName},

We are pleased to inform you that your adoption request has been APPROVED! 

Request Details:
- Applicant Name: ${adoptionRequest.firstName} ${adoptionRequest.lastName}
- Request ID: ${adoptionRequest._id}
- Request Date: ${new Date(adoptionRequest.createdAt).toLocaleDateString()}

Next Steps:
1. We will contact you within the next 24-48 hours to schedule a visit.
2. During the visit, you'll meet your future pet and we'll complete the necessary paperwork.
3. We'll explain all the details about your new pet's care and adaptation process.

If you have any questions in the meantime, please don't hesitate to contact us.

Thank you for choosing adoption!

Best regards,
The Little Pets Team
                `,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #4CAF50;">Congratulations! Your adoption request has been approved</h2>
                        
                        <p>Dear ${adoptionRequest.firstName},</p>
                        
                        <p>We are pleased to inform you that your adoption request has been <strong style="color: #4CAF50;">APPROVED</strong>!</p>
                        
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Request Details:</h3>
                            <ul style="list-style: none; padding-left: 0;">
                                <li>📝 <strong>Applicant Name:</strong> ${adoptionRequest.firstName} ${adoptionRequest.lastName}</li>
                                <li>🔢 <strong>Request ID:</strong> ${adoptionRequest._id}</li>
                                <li>📅 <strong>Request Date:</strong> ${new Date(adoptionRequest.createdAt).toLocaleDateString()}</li>
                            </ul>
                        </div>
                        
                        <h3>Next Steps:</h3>
                        <ol style="line-height: 1.6;">
                            <li>We will contact you within the next 24-48 hours to schedule a visit.</li>
                            <li>During the visit, you'll meet your future pet and we'll complete the necessary paperwork.</li>
                            <li>We'll explain all the details about your new pet's care and adaptation process.</li>
                        </ol>
                        
                        <p style="font-style: italic;">If you have any questions in the meantime, please don't hesitate to contact us.</p>
                        
                        <p><strong>Thank you for choosing adoption!</strong></p>
                        
                        <p>Best regards,<br>The Little Pets Team</p>
                    </div>
                `
            },
            rejected: {
                subject: 'Update on your adoption request',
                text: `
Dear ${adoptionRequest.firstName},

We are writing regarding your adoption request.

After careful review, we regret to inform you that we cannot proceed with your application at this time.

Request Details:
- Applicant Name: ${adoptionRequest.firstName} ${adoptionRequest.lastName}
- Request ID: ${adoptionRequest._id}
- Request Date: ${new Date(adoptionRequest.createdAt).toLocaleDateString()}

This does not mean you cannot adopt in the future. We encourage you to:
1. Review our adoption requirements
2. Consider applying again in the future
3. Contact us if you have questions about how to improve your application

We appreciate your interest in adoption and hope you will continue to consider providing a home to a pet in need.

Best regards,
The Little Pets Team
                `,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #FF8A2B;">Update on your adoption request</h2>
                        
                        <p>Dear ${adoptionRequest.firstName},</p>
                        
                        <p>We are writing regarding your adoption request.</p>
                        
                        <p>After careful review, we regret to inform you that we cannot proceed with your application at this time.</p>
                        
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Request Details:</h3>
                            <ul style="list-style: none; padding-left: 0;">
                                <li>📝 <strong>Applicant Name:</strong> ${adoptionRequest.firstName} ${adoptionRequest.lastName}</li>
                                <li>🔢 <strong>Request ID:</strong> ${adoptionRequest._id}</li>
                                <li>📅 <strong>Request Date:</strong> ${new Date(adoptionRequest.createdAt).toLocaleDateString()}</li>
                            </ul>
                        </div>
                        
                        <p>This does not mean you cannot adopt in the future. We encourage you to:</p>
                        <ol style="line-height: 1.6;">
                            <li>Review our adoption requirements</li>
                            <li>Consider applying again in the future</li>
                            <li>Contact us if you have questions about how to improve your application</li>
                        </ol>
                        
                        <p>We appreciate your interest in adoption and hope you will continue to consider providing a home to a pet in need.</p>
                        
                        <p>Best regards,<br>The Little Pets Team</p>
                    </div>
                `
            }
        };

        const msg = {
            to: adoptionRequest.email,
            from: process.env.FROM_EMAIL,
            subject: statusMessages[status].subject,
            text: statusMessages[status].text,
            html: statusMessages[status].html
        };

        await sgMail.send(msg);
        console.log(`${status} email sent to ${adoptionRequest.email}`);
        return true;
    } catch (error) {
        console.error('Error sending adoption email:', error);
        throw error;
    }
};

module.exports = {
    sendAdoptionStatusEmail
}; 