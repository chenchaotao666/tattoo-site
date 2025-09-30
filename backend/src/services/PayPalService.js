const axios = require('axios');
require('dotenv').config();

class PayPalService {
    constructor() {
        // PayPal API配置
        this.clientId = process.env.PAYPAL_CLIENT_ID;
        this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
        this.environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox'; // sandbox 或 production

        // API端点
        this.baseURL = this.environment === 'production'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        // 检查必要的环境变量
        if (!this.clientId || !this.clientSecret) {
            console.warn('PayPal credentials not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.');
        }
    }

    /**
     * 获取PayPal访问令牌
     */
    async getAccessToken() {
        try {
            console.log(`[PayPalService] Requesting access token from: ${this.baseURL}`);

            const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

            const response = await axios.post(`${this.baseURL}/v1/oauth2/token`,
                'grant_type=client_credentials',
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            console.log(`[PayPalService] Access token obtained successfully`);
            return response.data.access_token;
        } catch (error) {
            console.error('[PayPalService] Get PayPal access token error:', error.response?.data || error.message);
            if (error.response?.status) {
                console.error('[PayPalService] HTTP Status:', error.response.status);
            }
            throw new Error('Failed to get PayPal access token');
        }
    }

    /**
     * 创建PayPal订单
     */
    async createOrder(orderData) {
        try {
            const { amount, currency = 'USD', description, method } = orderData;

            const accessToken = await this.getAccessToken();

            const orderPayload = {
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: currency,
                        value: amount.toFixed(2)
                    },
                    description: description
                }],
                payment_source: this.getPaymentSourceConfig(method)
            };

            const response = await axios.post(`${this.baseURL}/v2/checkout/orders`,
                orderPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'PayPal-Request-Id': this.generateRequestId()
                    }
                }
            );

            return {
                id: response.data.id,
                status: response.data.status,
                links: response.data.links
            };
        } catch (error) {
            console.error('Create PayPal order error:', error.response?.data || error.message);
            throw new Error('Failed to create PayPal order');
        }
    }

    /**
     * 捕获PayPal订单
     */
    async captureOrder(orderId) {
        try {
            const accessToken = await this.getAccessToken();

            const response = await axios.post(`${this.baseURL}/v2/checkout/orders/${orderId}/capture`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'PayPal-Request-Id': this.generateRequestId()
                    }
                }
            );

            const capture = response.data.purchase_units?.[0]?.payments?.captures?.[0];

            return {
                status: response.data.status,
                captureId: capture?.id,
                captureStatus: capture?.status,
                amount: capture?.amount
            };
        } catch (error) {
            console.error('Capture PayPal order error:', error.response?.data || error.message);

            // 如果是4xx错误，可能是订单已经被处理过了
            if (error.response?.status >= 400 && error.response?.status < 500) {
                return {
                    status: 'FAILED',
                    captureId: null,
                    captureStatus: 'FAILED',
                    error: error.response?.data?.message || 'Capture failed'
                };
            }

            throw new Error('Failed to capture PayPal order');
        }
    }

    /**
     * 获取订单详情
     */
    async getOrderDetails(orderId) {
        try {
            const accessToken = await this.getAccessToken();

            const response = await axios.get(`${this.baseURL}/v2/checkout/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Get PayPal order details error:', error.response?.data || error.message);
            throw new Error('Failed to get PayPal order details');
        }
    }

    /**
     * 退款订单
     */
    async refundCapture(captureId, amount, currency = 'USD') {
        try {
            const accessToken = await this.getAccessToken();

            const refundPayload = {
                amount: {
                    value: amount.toFixed(2),
                    currency_code: currency
                }
            };

            const response = await axios.post(`${this.baseURL}/v2/payments/captures/${captureId}/refund`,
                refundPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'PayPal-Request-Id': this.generateRequestId()
                    }
                }
            );

            return {
                id: response.data.id,
                status: response.data.status,
                amount: response.data.amount
            };
        } catch (error) {
            console.error('Refund PayPal capture error:', error.response?.data || error.message);
            throw new Error('Failed to refund PayPal capture');
        }
    }

    /**
     * 获取支付方式配置
     */
    getPaymentSourceConfig(method) {
        switch (method) {
            case 'paypal':
                return {
                    paypal: {
                        experience_context: {
                            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
                            brand_name: 'Tattoo Design Studio',
                            locale: 'en-US',
                            landing_page: 'LOGIN',
                            user_action: 'PAY_NOW'
                        }
                    }
                };
            case 'card':
                return {
                    card: {
                        experience_context: {
                            brand_name: 'Tattoo Design Studio'
                        }
                    }
                };
            default:
                return {
                    paypal: {
                        experience_context: {
                            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
                            brand_name: 'Tattoo Design Studio',
                            locale: 'en-US',
                            landing_page: 'LOGIN',
                            user_action: 'PAY_NOW'
                        }
                    }
                };
        }
    }

    /**
     * 生成请求ID
     */
    generateRequestId() {
        return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 验证webhook签名
     */
    async verifyWebhookSignature(headers, body, webhookId) {
        try {
            const accessToken = await this.getAccessToken();

            const verificationPayload = {
                auth_algo: headers['paypal-auth-algo'],
                cert_id: headers['paypal-cert-id'],
                transmission_id: headers['paypal-transmission-id'],
                transmission_sig: headers['paypal-transmission-sig'],
                transmission_time: headers['paypal-transmission-time'],
                webhook_id: webhookId,
                webhook_event: JSON.parse(body)
            };

            const response = await axios.post(`${this.baseURL}/v1/notifications/verify-webhook-signature`,
                verificationPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            return response.data.verification_status === 'SUCCESS';
        } catch (error) {
            console.error('Verify PayPal webhook signature error:', error.response?.data || error.message);
            return false;
        }
    }

}

module.exports = PayPalService;