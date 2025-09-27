const BaseModel = require('./BaseModel');

class ImageReport extends BaseModel {
    constructor(db) {
        super(db, 'image_reports');
    }

    // 根据图片ID查找举报
    async findByImageId(imageId, options = {}) {
        try {
            const filters = { ...options.filters, imageId };
            return await this.findAll({ ...options, filters });
        } catch (error) {
            throw new Error(`Find reports by image failed: ${error.message}`);
        }
    }

    // 根据用户ID查找举报
    async findByUserId(userId, options = {}) {
        try {
            const filters = { ...options.filters, userId };
            return await this.findAll({ ...options, filters });
        } catch (error) {
            throw new Error(`Find reports by user failed: ${error.message}`);
        }
    }

    // 根据举报类型查找
    async findByType(reportType, options = {}) {
        try {
            const filters = { ...options.filters, report_type: reportType };
            return await this.findAll({ ...options, filters });
        } catch (error) {
            throw new Error(`Find reports by type failed: ${error.message}`);
        }
    }

    // 获取举报统计
    async getReportStats() {
        try {
            const query = `
                SELECT
                    report_type,
                    COUNT(*) as count
                FROM ${this.tableName}
                GROUP BY report_type
                ORDER BY count DESC
            `;
            const [rows] = await this.db.execute(query);
            return rows;
        } catch (error) {
            throw new Error(`Get report stats failed: ${error.message}`);
        }
    }
}

module.exports = ImageReport;