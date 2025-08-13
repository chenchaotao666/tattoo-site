import { ApiUtils } from '../utils/apiUtils';

// 举报接口定义
export interface ImageReport {
  id: string;
  imageId: string;
  userId: string;
  content: string;
  report_type: string;
  created_at: string;
  // 关联数据（可选）
  image?: {
    id: string;
    title: any; // JSON multilingual
    tattooUrl: string;
  };
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// 举报类型枚举
export enum ReportType {
  INAPPROPRIATE = 'inappropriate',
  SPAM = 'spam',
  COPYRIGHT = 'copyright',
  VIOLENCE = 'violence',
  ADULT_CONTENT = 'adult_content',
  FAKE = 'fake',
  OTHER = 'other'
}

// 举报统计
export interface ReportStats {
  report_type: string;
  count: number;
}

// 分页响应接口
export interface PaginatedReportsResponse {
  success: boolean;
  message: string;
  data: ImageReport[];
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// API响应接口
export interface ReportResponse {
  success: boolean;
  message: string;
  data: ImageReport | ImageReport[] | ReportStats[];
}

// 查询参数接口
export interface ReportsQueryParams {
  currentPage?: number;
  pageSize?: number;
  sortBy?: string | string[];
  sortOrder?: 'ASC' | 'DESC' | string[];
  report_type?: string;
  imageId?: string;
  userId?: string;
}

// 举报创建接口
export interface CreateReportRequest {
  imageId: string;
  content: string;
  report_type: ReportType;
}

class ReportsService {
  /**
   * 创建举报
   */
  async createReport(reportData: CreateReportRequest): Promise<ImageReport> {
    const response = await ApiUtils.post<ReportResponse>('/api/reports', reportData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create report');
    }
    return response.data as ImageReport;
  }

  /**
   * 举报图片（简化方法）
   */
  async reportImage(imageId: string, type: ReportType, content: string = ''): Promise<ImageReport> {
    return await this.createReport({
      imageId,
      content,
      report_type: type
    });
  }

  /**
   * 获取所有举报（管理员功能）
   */
  async getAll(params: ReportsQueryParams = {}): Promise<PaginatedReportsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.currentPage) searchParams.append('currentPage', params.currentPage.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.report_type) searchParams.append('report_type', params.report_type);
    if (params.imageId) searchParams.append('imageId', params.imageId);
    if (params.userId) searchParams.append('userId', params.userId);
    if (params.sortBy) {
      if (Array.isArray(params.sortBy)) {
        params.sortBy.forEach(field => searchParams.append('sortBy', field));
      } else {
        searchParams.append('sortBy', params.sortBy);
      }
    }
    if (params.sortOrder) {
      if (Array.isArray(params.sortOrder)) {
        params.sortOrder.forEach(order => searchParams.append('sortOrder', order));
      } else {
        searchParams.append('sortOrder', params.sortOrder);
      }
    }

    const queryString = searchParams.toString();
    const url = queryString ? `/api/reports?${queryString}` : '/api/reports';
    
    return await ApiUtils.get<PaginatedReportsResponse>(url);
  }

  /**
   * 根据ID获取举报详情（管理员功能）
   */
  async getById(id: string): Promise<ImageReport> {
    const response = await ApiUtils.get<ReportResponse>(`/api/reports/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to get report');
    }
    return response.data as ImageReport;
  }

  /**
   * 获取图片的所有举报（管理员功能）
   */
  async getImageReports(imageId: string, params: Omit<ReportsQueryParams, 'imageId'> = {}): Promise<PaginatedReportsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.currentPage) searchParams.append('currentPage', params.currentPage.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.report_type) searchParams.append('report_type', params.report_type);
    if (params.sortBy) {
      if (Array.isArray(params.sortBy)) {
        params.sortBy.forEach(field => searchParams.append('sortBy', field));
      } else {
        searchParams.append('sortBy', params.sortBy);
      }
    }
    if (params.sortOrder) {
      if (Array.isArray(params.sortOrder)) {
        params.sortOrder.forEach(order => searchParams.append('sortOrder', order));
      } else {
        searchParams.append('sortOrder', params.sortOrder);
      }
    }

    const queryString = searchParams.toString();
    const url = queryString ? `/api/reports/image/${imageId}?${queryString}` : `/api/reports/image/${imageId}`;
    
    return await ApiUtils.get<PaginatedReportsResponse>(url);
  }

  /**
   * 获取用户的举报记录
   */
  async getUserReports(userId: string, params: Omit<ReportsQueryParams, 'userId'> = {}): Promise<PaginatedReportsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.currentPage) searchParams.append('currentPage', params.currentPage.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.report_type) searchParams.append('report_type', params.report_type);
    if (params.imageId) searchParams.append('imageId', params.imageId);
    if (params.sortBy) {
      if (Array.isArray(params.sortBy)) {
        params.sortBy.forEach(field => searchParams.append('sortBy', field));
      } else {
        searchParams.append('sortBy', params.sortBy);
      }
    }
    if (params.sortOrder) {
      if (Array.isArray(params.sortOrder)) {
        params.sortOrder.forEach(order => searchParams.append('sortOrder', order));
      } else {
        searchParams.append('sortOrder', params.sortOrder);
      }
    }

    const queryString = searchParams.toString();
    const url = queryString ? `/api/reports/user/${userId}?${queryString}` : `/api/reports/user/${userId}`;
    
    return await ApiUtils.get<PaginatedReportsResponse>(url);
  }

  /**
   * 按类型获取举报
   */
  async getByType(type: ReportType, params: Omit<ReportsQueryParams, 'report_type'> = {}): Promise<PaginatedReportsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.currentPage) searchParams.append('currentPage', params.currentPage.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.imageId) searchParams.append('imageId', params.imageId);
    if (params.userId) searchParams.append('userId', params.userId);
    if (params.sortBy) {
      if (Array.isArray(params.sortBy)) {
        params.sortBy.forEach(field => searchParams.append('sortBy', field));
      } else {
        searchParams.append('sortBy', params.sortBy);
      }
    }
    if (params.sortOrder) {
      if (Array.isArray(params.sortOrder)) {
        params.sortOrder.forEach(order => searchParams.append('sortOrder', order));
      } else {
        searchParams.append('sortOrder', params.sortOrder);
      }
    }

    const queryString = searchParams.toString();
    const url = queryString ? `/api/reports/type/${type}?${queryString}` : `/api/reports/type/${type}`;
    
    return await ApiUtils.get<PaginatedReportsResponse>(url);
  }

  /**
   * 获取举报统计（管理员功能）
   */
  async getStats(): Promise<ReportStats[]> {
    const response = await ApiUtils.get<ReportResponse>('/api/reports/stats');
    if (!response.success) {
      throw new Error(response.message || 'Failed to get report stats');
    }
    return response.data as ReportStats[];
  }

  /**
   * 删除举报（管理员功能）
   */
  async delete(id: string): Promise<void> {
    const response = await ApiUtils.delete<ReportResponse>(`/api/reports/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete report');
    }
  }

  /**
   * 批量删除举报（管理员功能）
   */
  async batchDelete(ids: string[]): Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
  }> {
    const response = await ApiUtils.delete<{
      success: boolean;
      message: string;
      data: {
        success: boolean;
        message: string;
        deletedCount: number;
      };
    }>('/api/reports/batch', undefined, { ids });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to batch delete reports');
    }
    return response.data;
  }

  /**
   * 获取举报总数
   */
  async getCount(filters: Record<string, any> = {}): Promise<number> {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const url = queryString ? `/api/reports/count?${queryString}` : '/api/reports/count';
    
    const response = await ApiUtils.get<{
      success: boolean;
      message: string;
      data: { count: number };
    }>(url);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to get reports count');
    }
    return response.data.count;
  }

  /**
   * 检查用户是否已举报某图片
   */
  async hasUserReported(imageId: string): Promise<boolean> {
    try {
      const reports = await this.getUserReports('current', { imageId, pageSize: 1 });
      return reports.data.length > 0;
    } catch (error) {
      console.warn('Failed to check user report status:', error);
      return false;
    }
  }

  /**
   * 获取可用的举报类型列表
   */
  getReportTypes(): { value: ReportType; label: string; description?: string }[] {
    return [
      { value: ReportType.INAPPROPRIATE, label: 'Inappropriate Content', description: 'Content that violates community guidelines' },
      { value: ReportType.SPAM, label: 'Spam', description: 'Unwanted or repetitive content' },
      { value: ReportType.COPYRIGHT, label: 'Copyright Violation', description: 'Unauthorized use of copyrighted material' },
      { value: ReportType.VIOLENCE, label: 'Violence', description: 'Content depicting violence or harm' },
      { value: ReportType.ADULT_CONTENT, label: 'Adult Content', description: 'Sexually explicit or adult material' },
      { value: ReportType.FAKE, label: 'Fake/Misleading', description: 'False or misleading information' },
      { value: ReportType.OTHER, label: 'Other', description: 'Other issues not listed above' },
    ];
  }
}

export default new ReportsService();