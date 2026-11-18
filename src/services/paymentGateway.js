/**
 * Unit 5 Strategy Pattern: External Payment Sandbox Provider
 */
class PaymentGateway {
    async initializePayment({ reference, amount, email }) {
        return {
            status: true,
            message: "Paystack Sandbox Authorization URL created",
            checkoutUrl: `https://checkout.paystack.com/sandbox-checkout?ref=${reference}&amount=${amount}`
        };
    }

    async verifyPayment(reference) {
        return {
            status: true,
            data: {
                reference,
                status: 'success',
                gateway_response: 'Successful Sandbox Transaction'
            }
        };
    }
}

module.exports = new PaymentGateway();

