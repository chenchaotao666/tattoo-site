import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { generateRobotsTxt } from 'vite-plugin-robots-txt';
import sitemapPlugin from 'vite-plugin-sitemap';

// 加载动态路由的函数
async function getDynamicRoutes() {
    try {
        // 导入动态路由获取逻辑
        const { getDynamicRoutes: fetchDynamicRoutes } = await import('./scripts/dynamic-routes.mjs');
        const dynamicRoutes = await fetchDynamicRoutes();

        // 支持的语言
        const languages = ['en', 'zh'];
        const allRoutes = [];

        // 为每个动态路由生成多语言版本
        dynamicRoutes.forEach(route => {
            languages.forEach(lang => {
                if (lang === 'en') {
                    allRoutes.push(route);
                } else {
                    allRoutes.push(`/${lang}${route}`);
                }
            });
        });

        console.log(`✅ Found ${dynamicRoutes.length} dynamic routes, ${allRoutes.length} total with i18n`);
        return allRoutes;
    } catch (error) {
        console.warn('⚠️  Failed to fetch dynamic routes:', error.message);
        return [];
    }
}

// 静态路由
const staticRoutes = [
    '/',
    '/price',
    '/create',
    '/categories',
    '/register',
    '/login',
    '/privacy-policy',
    '/terms',
    '/refund-policy',
    '/blog'
];

// 生成多语言静态路由
function generateStaticRoutes() {
    const languages = ['en', 'zh'];
    const routes = [];

    languages.forEach(lang => {
        staticRoutes.forEach(route => {
            if (lang === 'en') {
                routes.push(route);
            } else {
                routes.push(`/${lang}${route}`);
            }
        });
    });

    return routes;
}

// https://vitejs.dev/config/
export default defineConfig(async () => {
    // 获取所有路由（静态 + 动态）
    const staticRoutesWithI18n = generateStaticRoutes();
    const dynamicRoutesWithI18n = await getDynamicRoutes();
    const allRoutes = [...staticRoutesWithI18n, ...dynamicRoutesWithI18n];

    return {
        plugins: [
            react(),
            generateRobotsTxt({
                policies: [
                    {
                        userAgent: '*',
                        allow: [
                            '/',
                            '/en/',
                            '/de/',
                            '/tr/',
                            '/it/',
                            '/es/',
                            '/fr/',
                            '/pt/',
                            '/nn/',
                            '/ar/',
                            '/ja/',
                            '/ko/',
                            '/zh/',
                            '/tw/',
                            '/ru/',
                            '/nl/',
                            '/sv/',
                            '/hi/'
                        ],
                        disallow: [
                            '/api/'
                        ]
                    }
                ],
                sitemaps: ['https://aitattoo.art/sitemap.xml']
            }),
            sitemapPlugin({
                hostname: 'https://aitattoo.art',
                dynamicRoutes: allRoutes,
                changefreq: 'weekly',
                priority: 0.8,
                lastmod: new Date(),
                generateRobotsTxt: false // 我们单独处理 robots.txt
            })
        ],
        resolve: {
            alias: {
                '@': path.resolve(path.dirname(new URL(import.meta.url).pathname), './src')
            }
        },
        base: '/',
        build: {
            outDir: 'dist',
            sourcemap: false,
            assetsDir: 'assets',
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ['react', 'react-dom'],
                        router: ['react-router-dom'],
                        three: ['three']
                    }
                }
            }
        },
        server: {
            port: 3008,
            open: true,
            proxy: {
                '/api': {
                    target: process.env.VITE_API_BASE_URL,
                    changeOrigin: true,
                    secure: false,
                    timeout: 10000, // 10秒超时
                    configure: function (proxy, _options) {
                        proxy.on('error', function (err, _req, _res) {
                            console.log('proxy error', err);
                        });
                        proxy.on('proxyReq', function (proxyReq, req, _res) {
                            console.log('Sending Request to the Target:', req.method, req.url);
                        });
                        proxy.on('proxyRes', function (proxyRes, req, _res) {
                            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                        });
                    },
                },
                '/uploads': {
                    target: process.env.VITE_API_BASE_URL,
                    changeOrigin: true,
                    secure: false,
                    timeout: 10000, // 10秒超时
                    configure: function (proxy, _options) {
                        proxy.on('error', function (err, _req, _res) {
                            console.log('uploads proxy error', err);
                        });
                        proxy.on('proxyReq', function (proxyReq, req, _res) {
                            console.log('Sending Uploads Request to the Target:', req.method, req.url);
                        });
                        proxy.on('proxyRes', function (proxyRes, req, _res) {
                            console.log('Received Uploads Response from the Target:', proxyRes.statusCode, req.url);
                        });
                    },
                }
            }
        }
    };
});