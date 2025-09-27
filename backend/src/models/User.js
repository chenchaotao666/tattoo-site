const BaseModel = require('./BaseModel');

class User extends BaseModel {
    constructor(db) {
        super(db, 'users');
    }

    // 根据邮箱查找用户
    async findByEmail(email) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE email = ?`;
            const [rows] = await this.db.execute(query, [email]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw new Error(`Find user by email failed: ${error.message}`);
        }
    }

    // 根据用户名查找用户
    async findByUsername(username) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE username = ?`;
            const [rows] = await this.db.execute(query, [username]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw new Error(`Find user by username failed: ${error.message}`);
        }
    }

    // 根据refreshToken查找用户
    async findByRefreshToken(refreshToken) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE refreshToken = ?`;
            const [rows] = await this.db.execute(query, [refreshToken]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw new Error(`Find user by refresh token failed: ${error.message}`);
        }
    }

    // 验证用户密码
    async verifyPassword(email, password) {
        try {
            const user = await this.findByEmail(email);
            if (!user || !user.passwordHash) {
                return null;
            }

            const bcrypt = require('bcrypt');
            const isValid = await bcrypt.compare(password, user.passwordHash);
            
            if (isValid) {
                // 返回用户信息（不包含密码哈希）
                const { passwordHash, ...userWithoutPassword } = user;
                return userWithoutPassword;
            }
            
            return null;
        } catch (error) {
            throw new Error(`Verify password failed: ${error.message}`);
        }
    }



    // 获取用户统计信息
    async getUserStats(userId) {
        try {
            const query = `
                SELECT
                    u.id,
                    u.username,
                    u.email,
                    u.level,
                    COUNT(i.id) as imageCount,
                    COUNT(r.id) as reportCount
                FROM ${this.tableName} u
                LEFT JOIN images i ON u.id = i.userId
                LEFT JOIN image_reports r ON u.id = r.userId
                WHERE u.id = ?
                GROUP BY u.id
            `;
            const [rows] = await this.db.execute(query, [userId]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw new Error(`Get user stats failed: ${error.message}`);
        }
    }


    // 按角色查找用户
    async findByRole(role, options = {}) {
        try {
            const filters = { ...options.filters, role };
            return await this.findAll({ ...options, filters });
        } catch (error) {
            throw new Error(`Find users by role failed: ${error.message}`);
        }
    }

    // 按等级查找用户
    async findByLevel(level, options = {}) {
        try {
            const filters = { ...options.filters, level };
            return await this.findAll({ ...options, filters });
        } catch (error) {
            throw new Error(`Find users by level failed: ${error.message}`);
        }
    }
}

module.exports = User;