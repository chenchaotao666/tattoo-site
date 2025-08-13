const BaseService = require('./BaseService');

class UserService extends BaseService {
    constructor(userModel) {
        super(userModel);
    }

    // 根据邮箱查找用户
    async getUserByEmail(email) {
        try {
            if (!email) {
                throw new Error('Email is required');
            }

            return await this.model.findByEmail(email);
        } catch (error) {
            throw new Error(`Get user by email failed: ${error.message}`);
        }
    }

    // 根据用户名查找用户
    async getUserByUsername(username) {
        try {
            if (!username) {
                throw new Error('Username is required');
            }

            return await this.model.findByUsername(username);
        } catch (error) {
            throw new Error(`Get user by username failed: ${error.message}`);
        }
    }

    // 根据refresh token查找用户
    async getUserByRefreshToken(refreshToken) {
        try {
            if (!refreshToken) {
                throw new Error('Refresh token is required');
            }

            return await this.model.findByRefreshToken(refreshToken);
        } catch (error) {
            throw new Error(`Get user by refresh token failed: ${error.message}`);
        }
    }

    // 更新用户积分
    async updateUserCredits(userId, creditsChange) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            if (typeof creditsChange !== 'number') {
                throw new Error('Credits change must be a number');
            }

            return await this.model.updateCredits(userId, creditsChange);
        } catch (error) {
            throw new Error(`Update user credits failed: ${error.message}`);
        }
    }

    // 更新用户余额
    async updateUserBalance(userId, balanceChange) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            if (typeof balanceChange !== 'number') {
                throw new Error('Balance change must be a number');
            }

            return await this.model.updateBalance(userId, balanceChange);
        } catch (error) {
            throw new Error(`Update user balance failed: ${error.message}`);
        }
    }

    // 获取用户统计信息
    async getUserStats(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            return await this.model.getUserStats(userId);
        } catch (error) {
            throw new Error(`Get user stats failed: ${error.message}`);
        }
    }

    // 获取即将到期的会员
    async getExpiringMemberships(days = 7) {
        try {
            return await this.model.findExpiringMemberships(days);
        } catch (error) {
            throw new Error(`Get expiring memberships failed: ${error.message}`);
        }
    }

    // 按角色获取用户
    async getUsersByRole(role, query = {}) {
        try {
            if (!role) {
                throw new Error('Role is required');
            }

            const pagination = this.normalizePaginationParams(query);
            const sort = this.normalizeSortParams(query);
            const filters = this.normalizeFilters(query);

            const options = {
                ...pagination,
                ...sort,
                filters
            };

            return await this.model.findByRole(role, options);
        } catch (error) {
            throw new Error(`Get users by role failed: ${error.message}`);
        }
    }

    // 按等级获取用户
    async getUsersByLevel(level, query = {}) {
        try {
            if (!level) {
                throw new Error('Level is required');
            }

            const pagination = this.normalizePaginationParams(query);
            const sort = this.normalizeSortParams(query);
            const filters = this.normalizeFilters(query);

            const options = {
                ...pagination,
                ...sort,
                filters
            };

            return await this.model.findByLevel(level, options);
        } catch (error) {
            throw new Error(`Get users by level failed: ${error.message}`);
        }
    }

    // 创建用户（带验证）
    async createUser(userData) {
        try {
            const requiredFields = ['username', 'email'];
            const validationErrors = this.validateData(userData, requiredFields);

            if (validationErrors.length > 0) {
                throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
            }

            // 检查邮箱是否已存在
            const existingUserByEmail = await this.model.findByEmail(userData.email);
            if (existingUserByEmail) {
                throw new Error('Email already exists');
            }

            // 检查用户名是否已存在
            const existingUserByUsername = await this.model.findByUsername(userData.username);
            if (existingUserByUsername) {
                throw new Error('Username already exists');
            }

            // 设置默认值
            const defaultUserData = {
                credits: 0,
                balance: 0.00,
                role: 'normal',
                level: 'free',
                ...userData
            };

            return await this.model.create(defaultUserData);
        } catch (error) {
            throw new Error(`Create user failed: ${error.message}`);
        }
    }

    // 更新用户（带验证）
    async updateUser(userId, userData) {
        try {
            // 如果要更新邮箱，检查是否已存在
            if (userData.email) {
                const existingUser = await this.model.findByEmail(userData.email);
                if (existingUser && existingUser.id !== userId) {
                    throw new Error('Email already exists');
                }
            }

            // 如果要更新用户名，检查是否已存在
            if (userData.username) {
                const existingUser = await this.model.findByUsername(userData.username);
                if (existingUser && existingUser.id !== userId) {
                    throw new Error('Username already exists');
                }
            }

            return await this.model.updateById(userId, userData);
        } catch (error) {
            throw new Error(`Update user failed: ${error.message}`);
        }
    }

    // 获取用户仪表板数据
    async getUserDashboard(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            const userStats = await this.model.getUserStats(userId);
            
            if (!userStats) {
                throw new Error('User not found');
            }

            // 额外的仪表板数据可以在这里添加
            return {
                ...userStats,
                // 可以添加更多统计数据
            };
        } catch (error) {
            throw new Error(`Get user dashboard failed: ${error.message}`);
        }
    }

    // 用户搜索（支持邮箱和用户名）
    async searchUsers(keyword, query = {}) {
        try {
            if (!keyword) {
                return await this.getAll(query);
            }

            const pagination = this.normalizePaginationParams(query);
            const sort = this.normalizeSortParams(query);
            const filters = this.normalizeFilters(query);

            // 构建搜索条件
            const searchFilters = {
                ...filters,
                $or: [
                    { username: { operator: 'LIKE', value: `%${keyword}%` } },
                    { email: { operator: 'LIKE', value: `%${keyword}%` } }
                ]
            };

            const options = {
                ...pagination,
                ...sort,
                filters: searchFilters
            };

            return await this.model.findAll(options);
        } catch (error) {
            throw new Error(`Search users failed: ${error.message}`);
        }
    }
}

module.exports = UserService;