import { ApiUtils, ApiError } from '../utils/apiUtils';

// 支付订单创建请求接口
export interface CreateOrderRequest {
  planCode: 'day7' | 'day14' | 'day30';
  method: 'paypal' | 'card' | 'applepay' | 'creem';
  chargeType: 'Credit'; // 新系统统一使用Credit类型
  rechargeAmount?: number; // 将根据planCode自动计算，此字段保留兼容性
}

// 支付订单创建响应接口
export interface CreateOrderResponse {
  id: string;
  amount: number;
  paymentUrl?: string; // Creem 支付链接
  creemSessionId?: string; // Creem 会话ID
}

// PayPal订单捕获请求接口
export interface CaptureOrderRequest {
  orderID: string;
}

// 支付订单捕获响应接口
export interface CaptureOrderResponse {
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  message?: string;
  transactionId?: string;
}

// 订单信息接口
export interface OrderInfo {
  orderId: string;
  amount: string;
  currency: string;
  planCode: string;
  chargeType: 'Monthly' | 'Yearly' | 'Credit';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  creditsAdded: number;
  duration: number;
  giftMonth: string;
  gift_month: string;
  method: string;
  monthlyCredit: number;
}


/**
 * 定价和支付服务类
 */
export class PricingService {
  /**
   * 创建支付订单（支持 PayPal、Card、Apple Pay、Creem）
   */
  static async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const response = await ApiUtils.post<CreateOrderResponse>('/api/payment/order', data, true);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('1020', '创建支付订单失败');
    }
  }

  /**
   * 捕获支付订单（支持所有支付方式）
   */
  static async captureOrder(orderId: string): Promise<CaptureOrderResponse> {
    try {
      const response = await ApiUtils.post<CaptureOrderResponse>(`/api/payment/capture/${orderId}`, {}, true);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('1021', '捕获支付订单失败');
    }
  }

  /**
   * 创建 Creem 支付链接
   * @deprecated 使用 createOrder 方法代替
   */
  static async createCreemPayment(data: CreateOrderRequest): Promise<{ paymentUrl: string; sessionId: string }> {
    try {
      const response = await this.createOrder(data);
      return {
        paymentUrl: response.paymentUrl!,
        sessionId: response.creemSessionId!
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('1024', '创建 Creem 支付失败');
    }
  }

  /**
   * 验证 Creem 支付状态
   */
  static async verifyCreemPayment(sessionId: string): Promise<CaptureOrderResponse> {
    try {
      const response = await ApiUtils.get<CaptureOrderResponse>(`/api/payment/creem/verify/${sessionId}`, {}, true);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('1025', '验证 Creem 支付状态失败');
    }
  }

  /**
   * 获取订单历史
   */
  static async getOrderHistory(page: number = 1, pageSize: number = 10): Promise<OrderInfo[]> {
    try {
      const response = await ApiUtils.get<OrderInfo[]>('/api/payment/chargerecord', {
        page: page.toString(),
        pageSize: pageSize.toString()
      }, true);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('1023', '获取订单历史失败');
    }
  }
}

// 导出默认实例
export const pricingService = new PricingService();
