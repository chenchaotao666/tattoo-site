#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Replicate API 诊断工具\n');

// 1. 检查环境变量
console.log('1. 检查环境变量...');
require('dotenv').config();

const token = process.env.REPLICATE_API_TOKEN;
if (!token) {
    console.log('❌ REPLICATE_API_TOKEN 未设置');
    process.exit(1);
} else if (!token.startsWith('r8_')) {
    console.log('❌ REPLICATE_API_TOKEN 格式不正确 (应该以r8_开头)');
    console.log('   当前值:', token.substring(0, 10) + '...');
    process.exit(1);
} else {
    console.log('✅ REPLICATE_API_TOKEN 格式正确');
}

// 2. 检查网络连接
console.log('\n2. 检查网络连接...');
const https = require('https');

function testConnection(hostname, port = 443) {
    return new Promise((resolve) => {
        const socket = new require('net').Socket();
        socket.setTimeout(5000);
        
        socket.on('connect', () => {
            console.log(`✅ ${hostname}:${port} 连接成功`);
            socket.destroy();
            resolve(true);
        });
        
        socket.on('timeout', () => {
            console.log(`❌ ${hostname}:${port} 连接超时`);
            socket.destroy();
            resolve(false);
        });
        
        socket.on('error', (err) => {
            console.log(`❌ ${hostname}:${port} 连接失败:`, err.message);
            socket.destroy();
            resolve(false);
        });
        
        socket.connect(port, hostname);
    });
}

async function checkConnections() {
    await testConnection('api.replicate.com');
    await testConnection('api.deepseek.com');
    await testConnection('google.com'); // 基础网络测试
}

// 3. 检查Replicate包
console.log('\n3. 检查Replicate包...');
try {
    const Replicate = require('replicate');
    console.log('✅ Replicate包已安装');
    
    // 测试创建客户端
    const replicate = new Replicate({ auth: token });
    console.log('✅ Replicate客户端创建成功');
    
} catch (error) {
    console.log('❌ Replicate包问题:', error.message);
    console.log('请运行: npm install replicate');
    process.exit(1);
}

// 4. 测试API调用
console.log('\n4. 测试简单API调用...');
async function testAPI() {
    try {
        const Replicate = require('replicate');
        const replicate = new Replicate({ auth: token });
        
        console.log('正在测试API连接...');
        
        // 尝试获取账户信息
        const response = await fetch('https://api.replicate.com/v1/account', {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Replicate API 连接成功');
            const data = await response.json();
            console.log('账户信息:', data.username || 'N/A');
        } else {
            console.log('❌ Replicate API 调用失败:', response.status, response.statusText);
        }
        
    } catch (error) {
        console.log('❌ API测试失败:', error.message);
    }
}

// 运行所有检查
async function runDiagnosis() {
    await checkConnections();
    await testAPI();
    
    console.log('\n📋 诊断完成!');
    console.log('\n如果所有检查都通过但仍有问题，请检查:');
    console.log('- 服务器防火墙设置');
    console.log('- 代理设置');
    console.log('- Replicate API 服务状态');
}

runDiagnosis().catch(console.error);