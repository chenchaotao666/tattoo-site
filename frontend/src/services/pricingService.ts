import { ApiUtils, ApiError } from '../utils/apiUtils';

// 支付订单创建请求接口
export interface CreateOrderRequest {
  planCode: 'FREE' | 'LITE' | 'PRO';
  method: 'paypal' | 'card' | 'applepay';
  chargeType: 'Monthly' | 'Yearly' | 'Credit';
  rechargeAmount?: number; // 充值金额，默认 0。Monthly/Yearly 可省略或传 0，Credit 类型下必填且 ≥ 10
}

// PayPal订单创建响应接口
export interface CreateOrderResponse {
  id: string;
  amount: number;
}

// PayPal订单捕获请求接口
export interface CaptureOrderRequest {
  orderID: string;
}

// PayPal订单捕获响应接口
export interface CaptureOrderResponse {
  status: 'COMPLETED' | 'FAILED';
  message?: string;
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
   * 创建PayPal支付订单
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
   * 捕获PayPal支付订单
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
