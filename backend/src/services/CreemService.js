const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

class CreemService {
    constructor() {
        // Creem API配置 - 基于真实的 Creem API
        this.apiKey = process.env.CREEM_API_KEY;
        this.webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

        // API端点 - 根据 API 密钥类型选择端点
        this.baseURL = this.apiKey?.startsWith('creem_test_')
            ? 'https://test-api.creem.io'
            : 'https://api.creem.io';

        // 回调URL配置
        this.successUrl = process.env.CREEM_SUCCESS_URL || 'https://aitattoo.art/payment/creem/callback?status=success';
        this.cancelUrl = process.env.CREEM_CANCEL_URL || 'https://aitattoo.art/payment/creem/callback?status=cancelled';
        this.webhookUrl = process.env.CREEM_WEBHOOK_URL || 'https://aitattoo.art/api/webhooks/creem';

        // 产品ID配置 - 需要在 Creem 控制台预先创建产品
        this.productIds = {
            'day7': process.env.CREEM_PRODUCT_ID_7DAY,
            'day14': process.env.CREEM_PRODUCT_ID_14DAY,
            'day30': process.env.CREEM_PRODUCT_ID_30DAY
        };

        // 检查必要的环境变量
        if (!this.apiKey) {
            console.error('[CreemService] Missing required environment variable: CREEM_API_KEY');
            console.error('[CreemService] Please check your .env file and ensure Creem API key is configured.');

            // 在开发环境下抛出错误，生产环境下只记录警告
            if (process.env.NODE_ENV === 'development') {
                throw new Error('Creem service initialization failed: missing CREEM_API_KEY');
            }
        } else {
            console.log('[CreemService] Initialized successfully');
        }
    }

    /**
     * 创建 Creem checkout session - 基于真实的 Creem API
     */
    async createCheckoutSession(planCode, requestId = null, successUrl = null, userEmail = null) {
        try {
            // 获取对应套餐的产品ID
            const productId = this.productIds[planCode];
            if (!productId) {
                throw new Error(`No product ID configured for plan: ${planCode}`);
            }

            const checkoutData = {
                product_id: productId
            };

            // 添加可选参数
            if (requestId) {
                checkoutData.request_id = requestId;
            }

            if (successUrl) {
                checkoutData.success_url = successUrl;
            }

            if (userEmail) {
                checkoutData.customer_email = userEmail;
            }

            // 注意: Creem API 不支持 webhook_url 和 cancel_url 参数
            // webhook 需要在 Creem 控制台中配置
            // cancel_url 不被支持

            const headers = {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey
            };

            console.log(`[CreemService] Creating checkout session for plan: ${planCode}, product: ${productId}`);

            const response = await axios.post(
                `${this.baseURL}/v1/checkouts`,
                checkoutData,
                { headers }
            );

            console.log(`[CreemService] Checkout session created:`, response.data);

            return {
                checkoutId: response.data.id,
                checkoutUrl: response.data.checkout_url,
                productId: productId,
                requestId: requestId
            };
        } catch (error) {
            const errorDetails = {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                planCode: planCode
            };

            console.error('[CreemService] Create checkout session error:', errorDetails);

            // 根据HTTP状态码提供具体的错误信息
            if (error.response?.status) {
                switch (error.response.status) {
                    case 401:
                        throw new Error('Creem API authentication failed - check your API key');
                    case 400:
                        throw new Error(`Creem API request invalid: ${error.response.data?.message || 'Invalid product ID or parameters'}`);
                    case 404:
                        throw new Error('Product not found - please check your product ID configuration');
                    case 429:
                        throw new Error('Creem API rate limit exceeded - please try again later');
                    case 500:
                    case 502:
                    case 503:
                        throw new Error('Creem API service temporarily unavailable - please try again later');
                    default:
                        throw new Error(`Creem API error (${error.response.status}): ${error.response.data?.message || error.message}`);
                }
            } else if (error.code === 'ECONNREFUSED') {
                throw new Error('Cannot connect to Creem API - please check network connectivity');
            } else if (error.code === 'ETIMEDOUT') {
                throw new Error('Creem API request timeout - please try again');
            }

            throw new Error(`Failed to create Creem checkout session: ${error.message}`);
        }
    }

    /**
     * 兼容旧接口的方法
     * @deprecated 使用 createCheckoutSession 代替
     */
    async createPaymentSession(orderData) {
        const { orderId, planCode, userEmail } = orderData;

        // 使用新的 checkout API
        const result = await this.createCheckoutSession(
            planCode,
            orderId,
            this.successUrl,
            userEmail
        );

        // 返回兼容格式
        return {
            id: result.checkoutId,
            requestId: result.requestId,
            paymentUrl: result.checkoutUrl,
            status: 'created'
        };
    }

    /**
     * 获取支付会话状态
     */
    async getPaymentSession(sessionId) {
        try {
            const endpoint = `/v1/checkouts?checkout_id=${sessionId}`;
            const url = `${this.baseURL}${endpoint}`;
            const headers = this.generateHeaders();

            console.log(`[CreemService] Getting payment session status: ${sessionId}`);
            console.log(`[CreemService] Base URL: ${this.baseURL}`);
            console.log(`[CreemService] Request URL: ${url}`);
            console.log(`[CreemService] Headers:`, headers);

            const response = await axios.get(url, { headers });

            return {
                id: response.data.id,
                status: response.data.status || 'pending',
                amount: response.data.order?.amount || response.data.order?.total,
                currency: response.data.order?.currency || 'USD',
                externalOrderId: response.data.request_id,
                transactionId: response.data.order?.transaction,
                productId: response.data.product?.id || response.data.product,
                units: response.data.units,
                createdAt: response.data.order?.created_at,
                updatedAt: response.data.order?.updated_at
            };
        } catch (error) {
            const errorDetails = {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                sessionId: sessionId
            };

            console.error('[CreemService] Get payment session error:', errorDetails);

            // 根据HTTP状态码提供具体的错误信息
            if (error.response?.status) {
                switch (error.response.status) {
                    case 404:
                        throw new Error(`Checkout session not found: ${sessionId}`);
                    case 401:
                        throw new Error('Creem API authentication failed - check your API key');
                    case 500:
                        throw new Error('Creem API server error - service may be temporarily unavailable');
                    case 502:
                    case 503:
                        // 当Creem服务不可用时，返回pending状态而不是抛出错误
                        console.warn(`[CreemService] Creem API temporarily unavailable (${error.response.status}), returning pending status`);
                        return {
                            id: sessionId,
                            status: 'pending',
                            amount: null,
                            currency: 'USD',
                            externalOrderId: null,
                            paymentMethod: null,
                            transactionId: null,
                            checkoutUrl: null,
                            productId: null,
                            units: null,
                            createdAt: null,
                            updatedAt: null
                        };
                    default:
                        throw new Error(`Creem API error (${error.response.status}): ${error.response.data?.message || error.message}`);
                }
            }

            throw new Error(`Failed to get Creem payment session: ${error.message}`);
        }
    }

    generateHeaders() {
        // Creem API 只需要 API 密钥认证
        return {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey
        };
    }


    /**
     * 验证支付状态
     */
    async verifyPayment(sessionId) {
        try {
            const session = await this.getPaymentSession(sessionId);

            // Creem支付状态映射
            const statusMap = {
                'completed': 'COMPLETED',
                'failed': 'FAILED',
                'cancelled': 'CANCELLED',
                'pending': 'PENDING',
                'expired': 'FAILED'
            };

            return {
                status: statusMap[session.status] || 'PENDING',
                transactionId: session.transactionId,
                amount: session.amount,
                currency: session.currency,
                message: this.getStatusMessage(session.status)
            };
        } catch (error) {
            console.error('[CreemService] Verify payment error:', error.message);
            throw new Error('Failed to verify Creem payment');
        }
    }

    /**
     * 获取状态消息
     */
    getStatusMessage(status) {
        const messages = {
            'completed': 'Payment completed successfully',
            'failed': 'Payment failed',
            'cancelled': 'Payment was cancelled',
            'pending': 'Payment is being processed',
            'expired': 'Payment session expired'
        };
        return messages[status] || 'Unknown payment status';
    }

    /**
     * 处理退款
     */
    async createRefund(transactionId, amount, reason = 'Customer request') {
        try {
            const refundData = {
                transaction_id: transactionId,
                amount: Math.round(amount * 100), // 转换为分
                reason: reason,
                metadata: {
                    refund_requested_at: new Date().toISOString()
                }
            };

            const endpoint = '/v1/payment/refunds';
            const url = `${this.baseURL}${endpoint}`;
            const headers = this.generateHeaders();

            console.log(`[CreemService] Creating refund for transaction: ${transactionId}`);

            const response = await axios.post(url, refundData, { headers });

            return {
                id: response.data.refund_id,
                status: response.data.status,
                amount: response.data.amount / 100,
                transactionId: response.data.transaction_id,
                createdAt: response.data.created_at
            };
        } catch (error) {
            console.error('[CreemService] Create refund error:', error.response?.data || error.message);
            throw new Error('Failed to create Creem refund');
        }
    }

    /**
     * 验证 Creem webhook 签名
     */
    verifyWebhookSignature(payload, signature) {
        try {
            if (!this.webhookSecret) {
                console.warn('[CreemService] Webhook secret not configured, skipping verification');
                return true; // 在没有配置 webhook secret 的情况下跳过验证
            }

            const expectedSignature = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(payload)
                .digest('hex');

            const providedSignature = signature.replace('sha256=', '');

            return crypto.timingSafeEqual(
                Buffer.from(expectedSignature),
                Buffer.from(providedSignature)
            );
        } catch (error) {
            console.error('[CreemService] Webhook signature verification error:', error.message);
            return false;
        }
    }


    /**
     * 生成唯一请求ID
     */
    generateRequestId() {
        return 'creem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
    }

    /**
     * 健康检查
     */
    async healthCheck() {
        try {
            const endpoint = '/v1/health';
            const url = `${this.baseURL}${endpoint}`;
            const headers = this.generateHeaders();

            const response = await axios.get(url, { headers });
            return response.data;
        } catch (error) {
            console.error('[CreemService] Health check error:', error.message);
            throw new Error('Creem service health check failed');
        }
    }
}

module.exports = CreemService;