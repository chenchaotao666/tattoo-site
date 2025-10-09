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
                const routePath = lang === 'en' ? route : `/${lang}${route}`;

                // 根据路由类型设置不同的优先级和更新频率
                let priority = 0.6; // 默认优先级
                let changefreq = 'weekly'; // 默认更新频率

                if (route.startsWith('/categories/')) {
                    priority = 0.7;
                    changefreq = 'weekly';
                } else if (route.startsWith('/blog/')) {
                    priority = 0.5;
                    changefreq = 'monthly';
                }

                allRoutes.push({
                    url: routePath,
                    changefreq: changefreq,
                    priority: priority
                });
            });
        });

        console.log(`✅ Found ${dynamicRoutes.length} dynamic routes, ${allRoutes.length} total with i18n`);
        return allRoutes;
    } catch (error) {
        console.warn('⚠️  Failed to fetch dynamic routes:', error.message);
        return [];
    }
}

// 静态路由配置 - 包含优先级和更新频率
const staticRoutesConfig = [
    {
        path: '/',
        priority: 1.0,
        changefreq: 'daily',
        multilang: true
    },
    {
        path: '/create',
        priority: 0.9,
        changefreq: 'weekly',
        multilang: true
    },
    {
        path: '/categories',
        priority: 0.8,
        changefreq: 'weekly',
        multilang: true
    },
    {
        path: '/price',
        priority: 0.7,
        changefreq: 'monthly',
        multilang: true
    },
    {
        path: '/blog',
        priority: 0.8,
        changefreq: 'weekly',
        multilang: true
    },
    {
        path: '/register',
        priority: 0.4,
        changefreq: 'monthly',
        multilang: false
    },
    {
        path: '/login',
        priority: 0.4,
        changefreq: 'monthly',
        multilang: false
    },
    {
        path: '/privacy-policy',
        priority: 0.3,
        changefreq: 'yearly',
        multilang: true
    },
    {
        path: '/terms',
        priority: 0.3,
        changefreq: 'yearly',
        multilang: true
    },
    {
        path: '/refund-policy',
        priority: 0.3,
        changefreq: 'yearly',
        multilang: true
    }
];

// 生成多语言静态路由
function generateStaticRoutes() {
    const languages = ['en', 'zh'];
    const routes = [];

    staticRoutesConfig.forEach(routeConfig => {
        if (routeConfig.multilang) {
            languages.forEach(lang => {
                const routePath = lang === 'en' ? routeConfig.path : `/${lang}${routeConfig.path}`;
                routes.push({
                    url: routePath,
                    changefreq: routeConfig.changefreq,
                    priority: routeConfig.priority
                });
            });
        } else {
            // 单语言页面只使用英文版本
            routes.push({
                url: routeConfig.path,
                changefreq: routeConfig.changefreq,
                priority: routeConfig.priority
            });
        }
    });

    return routes;
}

// https://vitejs.dev/config/
export default defineConfig(async () => {
    // 获取所有路由（静态 + 动态）
    const staticRoutesWithI18n = generateStaticRoutes();
    const dynamicRoutesWithI18n = await getDynamicRoutes();
    const allRoutes = [...staticRoutesWithI18n, ...dynamicRoutesWithI18n];

    // 创建去重的路由映射，保留优先级最高的配置
    const uniqueRoutes = new Map();
    allRoutes.forEach(route => {
        if (!uniqueRoutes.has(route.url) || uniqueRoutes.get(route.url).priority < route.priority) {
            uniqueRoutes.set(route.url, route);
        }
    });

    const finalRoutes = Array.from(uniqueRoutes.values());
    console.log(`📊 Generated ${allRoutes.length} routes, after deduplication: ${finalRoutes.length} unique routes`);

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
                            '/zh/',
                            // '/de/',
                            // '/tr/',
                            // '/it/',
                            // '/es/',
                            // '/fr/',
                            // '/pt/',
                            // '/nn/',
                            // '/ar/',
                            // '/ja/',
                            // '/ko/',
                            // '/tw/',
                            // '/ru/',
                            // '/nl/',
                            // '/sv/',
                            // '/hi/'
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
                dynamicRoutes: finalRoutes.map(route => route.url),
                exclude: [], // 明确排除自动路由扫描
                outDir: 'dist',
                extensions: [], // 不自动扫描文件
                changefreq: finalRoutes.reduce((acc, route) => {
                    acc[route.url] = route.changefreq;
                    return acc;
                }, {}),
                priority: finalRoutes.reduce((acc, route) => {
                    acc[route.url] = route.priority;
                    return acc;
                }, {}),
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