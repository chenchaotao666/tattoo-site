const BaseService = require('./BaseService');

class UserService extends BaseService {
    constructor(userModel, creditService = null, rechargeModel = null) {
        super(userModel);
        this.creditService = creditService;
        this.rechargeModel = rechargeModel;
    }

    // 处理用户数据字段映射
    processUserData(userData) {
        if (!userData) return null;
        
        // 字段映射：数据库字段 -> 前端期望字段
        const processed = { ...userData };
        
        // 处理ID字段映射
        if (processed.id !== undefined) {
            processed.userId = processed.id;
        }
        
        // 处理头像字段映射
        if (processed.avatarUrl !== undefined) {
            processed.avatar = processed.avatarUrl;
            delete processed.avatarUrl;
        }
        
        // 移除敏感字段
        delete processed.passwordHash;
        delete processed.refreshToken;
        delete processed.resetPasswordToken;
        
        return processed;
    }

    // 反向处理用户数据字段映射（用于存储）
    reverseProcessUserData(userData) {
        if (!userData) return null;
        
        const processed = { ...userData };
        
        // 字段映射：前端字段 -> 数据库字段
        if (processed.userId !== undefined && processed.id === undefined) {
            processed.id = processed.userId;
            delete processed.userId;
        }
        
        if (processed.avatar !== undefined) {
            processed.avatarUrl = processed.avatar;
            delete processed.avatar;
        }
        
        return processed;
    }

    // 重写基础方法以应用数据处理
    async getById(id) {
        try {
            const user = await super.getById(id);
            return this.processUserData(user);
        } catch (error) {
            throw new Error(`Get user by ID failed: ${error.message}`);
        }
    }

    async getAll(query = {}) {
        try {
            const result = await super.getAll(query);
            if (result.data) {
                result.data = result.data.map(user => this.processUserData(user));
            }
            return result;
        } catch (error) {
            throw new Error(`Get all users failed: ${error.message}`);
        }
    }

    // 根据邮箱查找用户
    async getUserByEmail(email) {
        try {
            if (!email) {
                throw new Error('Email is required');
            }

            const user = await this.model.findByEmail(email);
            return this.processUserData(user);
        } catch (error) {
            throw new Error(`Get user by email failed: ${error.message}`);
        }
    }

    // 根据refresh token查找用户
    async getUserByRefreshToken(refreshToken) {
        try {
            if (!refreshToken) {
                throw new Error('Refresh token is required');
            }

            const user = await this.model.findByRefreshToken(refreshToken);
            return this.processUserData(user);
        } catch (error) {
            throw new Error(`Get user by refresh token failed: ${error.message}`);
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


    // 创建用户（带验证）
    async createUser(userData) {
        try {
            const requiredFields = ['username', 'email'];
            // 如果有password字段，也作为必填项
            if (userData.password) {
                requiredFields.push('password');
            }
            
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

            // 处理字段映射和密码
            let processedUserData = this.reverseProcessUserData(userData);
            
            if (userData.password) {
                // 密码哈希处理
                const bcrypt = require('bcrypt');
                const saltRounds = 10;
                processedUserData.passwordHash = await bcrypt.hash(userData.password, saltRounds);
                delete processedUserData.password; // 移除原始密码字段
            }

            // 生成UUID
            const { v4: uuidv4 } = require('uuid');
            
            // 设置默认值
            const defaultUserData = {
                id: uuidv4(),
                role: 'normal',
                level: 'free',
                ...processedUserData
            };

            const createdUser = await this.model.create(defaultUserData);

            // 为新用户赠送 2 积分
            if (this.rechargeModel) {
                try {
                    const welcomeRecharge = {
                        id: uuidv4(),
                        userId: createdUser.id,
                        orderId: null, // 系统赠送无订单号
                        amount: 0.00, // 系统赠送金额为0
                        currency: 'USD',
                        status: 'success',
                        method: 'system',
                        planCode: 'welcome',
                        creditsAdded: 2,
                        chargeType: 'Credit',
                        duration: 0,
                        monthlyCredit: 0,
                        gift_month: '',
                        validDays: 365, // 365天有效期
                        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后过期
                        remainingCredits: 2,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    await this.rechargeModel.create(welcomeRecharge);
                    console.log(`Welcome credits granted to user ${createdUser.id}: 2 credits`);
                } catch (creditError) {
                    console.error(`Failed to grant welcome credits to user ${createdUser.id}:`, creditError.message);
                    // 积分赠送失败不应该影响用户创建
                }
            }

            return this.processUserData(createdUser);
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

            // 处理字段映射和密码更新
            let processedUserData = this.reverseProcessUserData(userData);
            
            if (userData.password) {
                const bcrypt = require('bcrypt');
                const saltRounds = 10;
                processedUserData.passwordHash = await bcrypt.hash(userData.password, saltRounds);
                delete processedUserData.password; // 移除原始密码字段
            }

            const updatedUser = await this.model.updateById(userId, processedUserData);
            return this.processUserData(updatedUser);
        } catch (error) {
            throw new Error(`Update user failed: ${error.message}`);
        }
    }

    // 用户登录
    async loginUser(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // 使用模型的 verifyPassword 方法进行验证
            const user = await this.model.verifyPassword(email, password);

            if (!user) {
                throw new Error('Invalid email or password');
            }

            // 检查是否是首次登录
            let isFirstLogin = false;
            if (!user.firstlogintAt) {
                isFirstLogin = true;
                // 更新首次登录时间
                await this.model.updateById(user.id, {
                    firstlogintAt: new Date(),
                    updatedAt: new Date()
                });
            }

            // 处理用户数据并返回，包含首次登录标识
            const processedUser = this.processUserData(user);
            return {
                ...processedUser,
                isFirstLogin
            };
        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    // 获取用户个人资料（用于已登录用户）
    async getUserProfile(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            const user = await this.model.findById(userId);

            if (!user) {
                throw new Error('User not found');
            }

            // 处理用户数据
            const processedUser = this.processUserData(user);

            // 如果有CreditService，获取用户积分信息
            if (this.creditService) {
                try {
                    const totalCredits = await this.creditService.getUserTotalCredits(userId);
                    processedUser.credits = totalCredits;
                } catch (creditError) {
                    console.warn(`Failed to get user credits for user ${userId}:`, creditError.message);
                    // 如果积分获取失败，设置为0，不影响用户资料的获取
                    processedUser.credits = 0;
                }
            } else {
                // 如果没有CreditService，设置默认值
                processedUser.credits = 0;
            }

            return processedUser;
        } catch (error) {
            throw new Error(`Get user profile failed: ${error.message}`);
        }
    }

    // 添加积分和订阅（支付成功后调用）
    async addCreditsAndSubscription(userId, subscriptionData) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            const { planCode, duration, chargeType } = subscriptionData;

            // 获取当前用户信息
            const user = await this.model.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // 准备更新数据
            const updateData = {
                updatedAt: new Date()
            };

            // 如果是订阅类型（不是单纯充值积分），更新会员等级
            if (duration > 0 && planCode !== 'FREE') {
                updateData.level = planCode.toLowerCase(); // 'lite' 或 'pro'

                // 如果是年费，记录购买的套餐类型
                if (chargeType === 'Yearly') {
                    updateData.yearlyPlan = planCode;
                }
            }

            // 更新用户数据
            const updatedUser = await this.model.updateById(userId, updateData);

            return this.processUserData(updatedUser);
        } catch (error) {
            throw new Error(`Add credits and subscription failed: ${error.message}`);
        }
    }

    // 忘记密码 - 发送重置邮件
    async forgotPassword(email, emailService) {
        try {
            if (!email) {
                throw new Error('Email is required');
            }

            if (!emailService) {
                throw new Error('Email service is required');
            }

            // 查找用户
            const user = await this.model.findByEmail(email.trim());
            if (!user) {
                throw new Error('Email not registered');
            }

            // 生成重置token（包含过期时间）
            const crypto = require('crypto');
            const tokenPart = crypto.randomBytes(32).toString('hex');
            const expiryTimestamp = Date.now() + 60 * 60 * 1000; // 1小时后过期
            const resetToken = `${tokenPart}:${expiryTimestamp}`;

            // 保存token到数据库
            const tokenSaved = await this.model.setResetPasswordToken(email, resetToken);
            if (!tokenSaved) {
                throw new Error('Failed to generate reset token');
            }

            // 发送重置密码邮件（只发送token部分，不包含时间戳）
            const emailResult = await emailService.sendPasswordResetEmail(email, tokenPart, user.username);

            if (!emailResult.success) {
                throw new Error('Failed to send reset email');
            }

            return {
                success: true,
                message: 'Password reset email sent successfully',
                messageId: emailResult.messageId
            };

        } catch (error) {
            console.error('Forgot password error:', error);
            throw new Error(`Forgot password failed: ${error.message}`);
        }
    }

    // 验证重置token
    async validateResetToken(resetToken) {
        try {
            if (!resetToken) {
                throw new Error('Reset token is required');
            }

            // 查找包含此token的用户
            const query = `SELECT * FROM users WHERE resetPasswordToken LIKE ?`;
            const [rows] = await this.model.db.execute(query, [`${resetToken}:%`]);

            if (rows.length === 0) {
                throw new Error('Invalid or expired reset token');
            }

            const user = rows[0];
            const fullToken = user.resetPasswordToken;

            // 验证token（使用User模型的方法）
            const validUser = await this.model.findByResetToken(fullToken);
            if (!validUser) {
                throw new Error('Invalid or expired reset token');
            }

            return {
                success: true,
                userId: user.id,
                email: user.email
            };

        } catch (error) {
            console.error('Validate reset token error:', error);
            throw new Error(`Token validation failed: ${error.message}`);
        }
    }

    // 重置密码
    async resetPassword(resetToken, newPassword) {
        try {
            if (!resetToken || !newPassword) {
                throw new Error('Reset token and new password are required');
            }

            if (newPassword.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            // 查找包含此token的用户
            const query = `SELECT * FROM users WHERE resetPasswordToken LIKE ?`;
            const [rows] = await this.model.db.execute(query, [`${resetToken}:%`]);

            if (rows.length === 0) {
                throw new Error('Invalid or expired reset token');
            }

            const fullToken = rows[0].resetPasswordToken;

            // 哈希新密码
            const bcrypt = require('bcrypt');
            const saltRounds = 10;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            // 更新密码并清除token
            const success = await this.model.resetPasswordWithToken(fullToken, newPasswordHash);
            if (!success) {
                throw new Error('Failed to reset password');
            }

            return {
                success: true,
                message: 'Password reset successfully'
            };

        } catch (error) {
            console.error('Reset password error:', error);
            throw new Error(`Password reset failed: ${error.message}`);
        }
    }

    // Google OAuth 登录
    async googleLogin(idToken) {
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        try {
            // 验证 Google ID Token
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            const { sub: googleId, email, name, picture } = payload;

            if (!email) {
                throw new Error('Google账户必须有邮箱地址');
            }

            // 检查用户是否已存在（通过邮箱或Google ID）
            let user = await this.model.findByEmail(email);
            let isFirstLogin = false;

            if (!user) {
                // 新用户，创建账户
                isFirstLogin = true;
                const { v4: uuidv4 } = require('uuid');

                // 从邮箱生成用户名（如果没有name的话）
                const username = name || email.split('@')[0];

                // 确保用户名唯一
                let finalUsername = username;
                let counter = 1;
                while (await this.model.findByUsername(finalUsername)) {
                    finalUsername = `${username}${counter}`;
                    counter++;
                }

                const currentTime = new Date();
                const newUserData = {
                    id: uuidv4(),
                    username: finalUsername,
                    email: email,
                    passwordHash: null,
                    avatarUrl: picture || null,
                    role: 'google',
                    level: 'free',
                    refreshToken: null,
                    resetPasswordToken: null,
                    firstlogintAt: currentTime,
                    createdAt: currentTime,
                    updatedAt: currentTime
                };

                user = await this.model.create(newUserData);

                // 为新用户赠送 2 积分
                if (this.rechargeModel) {
                    try {
                        const welcomeRecharge = {
                            id: uuidv4(),
                            userId: user.id,
                            orderId: null,
                            amount: 0.00,
                            currency: 'USD',
                            status: 'success',
                            method: 'system',
                            planCode: 'welcome',
                            creditsAdded: 2,
                            chargeType: 'Credit',
                            duration: 0,
                            monthlyCredit: 0,
                            gift_month: '',
                            validDays: 365,
                            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                            remainingCredits: 2,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };

                        await this.rechargeModel.create(welcomeRecharge);
                        console.log(`Welcome credits granted to Google user ${user.id}: 2 credits`);
                    } catch (creditError) {
                        console.error('Failed to grant welcome credits:', creditError);
                    }
                }
            } else {
                // 现有用户，检查是否是首次登录
                if (!user.firstlogintAt) {
                    isFirstLogin = true;
                    // 更新首次登录时间
                    await this.model.updateById(user.id, {
                        firstlogintAt: new Date(),
                        updatedAt: new Date()
                    });
                }
            }

            const processedUser = this.processUserData(user);
            return {
                ...processedUser,
                isFirstLogin
            };
        } catch (error) {
            console.error('Google OAuth login error:', error);
            if (error.message.includes('Token used too early') || error.message.includes('Token used too late')) {
                throw new Error('Google登录凭证已过期，请重试');
            } else if (error.message.includes('Invalid token')) {
                throw new Error('无效的Google登录凭证');
            } else if (error.message.includes('Wrong number of segments')) {
                throw new Error('Google登录凭证格式错误');
            }
            throw new Error(`Google登录失败: ${error.message}`);
        }
    }
}

module.exports = UserService;