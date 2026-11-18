/**
 * External SMS Sandbox Service (Twilio / Hubtel mock)
 */
class SMSService {
    async sendSMS(phoneNumber, message) {
        console.log(`\n========================================`);
        console.log(`[SMS SANDBOX GATEWAY DISPATCH]`);
        console.log(`To: ${phoneNumber}`);
        console.log(`Message: ${message}`);
        console.log(`========================================\n`);

        return {
            success: true,
            messageId: `SM_SANDBOX_${Date.now()}`
        };
    }
}

module.exports = new SMSService();

