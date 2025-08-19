#!/usr/bin/env node

require('dotenv').config();

// 强制使用node-fetch
global.fetch = require('node-fetch');

const Replicate = require('replicate');

console.log('🧪 简单Replicate API测试\n');

async function testSimpleAPI() {
    try {
        console.log('1. 检查环境变量...');
        const token = process.env.REPLICATE_API_TOKEN;
        if (!token) {
            throw new Error('REPLICATE_API_TOKEN not set');
        }
        console.log('✅ Token exists:', token.substring(0, 10) + '...');

        console.log('\n2. 创建Replicate客户端...');
        const replicate = new Replicate({
            auth: token,
            fetch: (url, options = {}) => {
                const fetch = require('node-fetch');
                console.log('🌐 Making request to:', url);
                
                return fetch(url, {
                    ...options,
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'tattoo-generator-test/1.0',
                        ...options.headers
                    }
                });
            }
        });
        console.log('✅ Replicate客户端创建成功');

        console.log('\n3. 测试简单预测...');
        
        // 使用一个简单的模型进行测试
        const prediction = await replicate.predictions.create({
            version: "8515c238222fa529763ec99b4ba1fa9d32ab5d6ebc82b4281de99e4dbdcec943",
            input: {
                prompt: "A simple test image",
                width: 512,
                height: 512,
                num_outputs: 1
            }
        });

        console.log('✅ 预测任务创建成功!');
        console.log('任务ID:', prediction.id);
        console.log('状态:', prediction.status);
        
        return true;
        
    } catch (error) {
        console.log('❌ 测试失败:', error.message);
        console.log('错误详情:', error);
        return false;
    }
}

testSimpleAPI()
    .then(success => {
        if (success) {
            console.log('\n🎉 测试成功! Replicate API连接正常');
        } else {
            console.log('\n💥 测试失败，需要进一步排查');
        }
    })
    .catch(console.error);