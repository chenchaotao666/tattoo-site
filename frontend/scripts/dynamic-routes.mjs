import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载.env文件
function loadEnvFile() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envLines = envFile.split('\n');

    envLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          // 只设置未定义的环境变量
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });
    console.log('✅ Loaded .env file');
  } else {
    console.log('⚠️  No .env file found');
  }
}

// 加载环境变量
loadEnvFile();

// API配置 - 从环境变量读取，支持多种配置方式
const API_BASE_URL = process.env.VITE_API_BASE_URL;

// 允许跳过API调用的选项（用于CI/CD环境）
const SKIP_API = process.env.SKIP_API === 'true';

// 简单的http/https请求函数，不依赖外部库
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Sitemap Generator',
        ...options.headers,
      }
    };

    const req = httpModule.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }

    req.end();
  });
}

// 工具函数：将displayName转换为SEO友好的URL路径
function convertDisplayNameToPath(displayName) {
  return displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 空格替换为短划线
    .replace(/-+/g, '-') // 多个短划线合并为一个
    .trim();
}

// 工具函数：从分类数据中提取英文名称作为SEO路径
function getEnglishNameFromCategory(displayName) {
  if (typeof displayName === 'string') {
    return convertDisplayNameToPath(displayName);
  }

  // 如果是LocalizedText对象，优先使用英文
  const englishName = displayName.en || displayName.zh || '';
  return convertDisplayNameToPath(englishName);
}

// API请求函数
async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Fetching: ${url}`);

    const data = await httpRequest(url, options);

    // 检查API响应格式
    if (data && data.status === 'success') {
      return data.data || data;
    } else if (data && Array.isArray(data)) {
      // 直接返回数组数据
      return data;
    } else if (data) {
      return data;
    } else {
      throw new Error('No data received');
    }
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error.message);
    return null;
  }
}

// 获取动态路由（分类和图片详情页）
export async function getDynamicRoutes() {
  const dynamicRoutes = [];

  // 如果设置了SKIP_API，直接返回空数组
  if (SKIP_API) {
    console.log('📁 Using local data only (API calls skipped)');
    return [];
  }

  try {
    console.log('🌐 Fetching categories from API...');

    // 从API获取分类数据
    const categories = await apiRequest('/api/categories');

    if (categories && Array.isArray(categories)) {
      console.log(`Found ${categories.length} categories`);

      // 添加分类详情页
      categories.forEach(category => {
        // 使用SEO友好的英文名称作为路径参数
        const seoName = getEnglishNameFromCategory(category.displayName || category.display_name || category.name || '');
        if (seoName && seoName.length > 0) {
          dynamicRoutes.push(`/categories/${seoName}`);
        } else {
          // 降级使用categoryId
          const fallbackParam = category.categoryId || category.name || category.id;
          if (fallbackParam) {
            console.warn(`Using fallback categoryId for category: ${JSON.stringify(category)}`);
            dynamicRoutes.push(`/categories/${fallbackParam}`);
          }
        }
      });
    } else {
      console.warn('No categories data received from API');
    }

    // 获取blog posts
    try {
      console.log('🌐 Fetching blog posts from API...');
      const postsResult = await apiRequest('/api/posts?status=published&sortBy=publishedAt&sortOrder=desc');

      if (postsResult && Array.isArray(postsResult)) {
        console.log(`Found ${postsResult.length} published blog posts`);

        // 添加blog详情页
        postsResult.forEach(post => {
          if (post.slug) {
            // URL编码处理slug中的特殊字符和空格
            const encodedSlug = encodeURIComponent(post.slug);
            dynamicRoutes.push(`/blog/${encodedSlug}`);
          }
        });
      } else {
        console.warn('No blog posts data received from API');
      }
    } catch (blogError) {
      console.warn('Failed to fetch blog posts:', blogError.message);
    }

  } catch (error) {
    console.error('Error loading dynamic routes:', error);
  }

  return dynamicRoutes;
}