const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 数据库连接池
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tattoo_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00'
});

// 将数据库连接池挂载到app上，供其他模块使用
app.locals.db = pool;

// API路由工厂函数
const createUserRoutes = require('./routes/userRoutes');
const createCategoryRoutes = require('./routes/categoryRoutes');
const createImageRoutes = require('./routes/imageRoutes');
const createStyleRoutes = require('./routes/styleRoutes');
const createIdeaRoutes = require('./routes/ideaRoutes');
const createTagRoutes = require('./routes/tagRoutes');
const createPostRoutes = require('./routes/postRoutes');
const createRechargeRoutes = require('./routes/rechargeRoutes');
const createReportRoutes = require('./routes/reportRoutes');

// 注册路由
app.use('/api/users', createUserRoutes(app));
app.use('/api/categories', createCategoryRoutes(app));
app.use('/api/images', createImageRoutes(app));
app.use('/api/styles', createStyleRoutes(app));
app.use('/api/ideas', createIdeaRoutes(app));
app.use('/api/tags', createTagRoutes(app));
app.use('/api/posts', createPostRoutes(app));
app.use('/api/recharges', createRechargeRoutes(app));
app.use('/api/reports', createReportRoutes(app));

// 健康检查端点
app.get('/health', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.execute('SELECT 1');
        connection.release();
        res.json({ status: 'healthy', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;