const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { Client } = require('minio');

class ImageGenerateService {
    constructor(imageModel = null, userModel = null) {
        // 强制Node.js使用node-fetch替代内置fetch
        if (!global.fetch) {
            global.fetch = require('node-fetch');
        }
        
        // 设置Node.js网络相关环境变量
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // 临时禁用TLS验证进行测试
        
        // 设置DNS解析
        require('dns').setDefaultResultOrder('ipv4first');
        // Store the image model and user model for database operations
        this.imageModel = imageModel;
        this.userModel = userModel;
        
        // Initialize with default parameters for SDXL Fresh Ink model
        this.defaultParams = {
            width: 1024,
            height: 1024,
            num_outputs: 1,
            scheduler: "K_EULER",
            guidance_scale: 7.5,
            num_inference_steps: 50,
            negative_prompt: "ugly, broken, distorted, blurry, low quality, bad anatomy",
            lora_scale: 0.6,
            refine: "expert_ensemble_refiner",
            high_noise_frac: 0.9,
            apply_watermark: false
        };
        
        // 使用完整的模型版本ID
        this.modelVersion = "fofr/sdxl-fresh-ink:8515c238222fa529763ec99b4ba1fa9d32ab5d6ebc82b4281de99e4dbdcec943";
        
        // 设置图片保存目录
        this.uploadDir = path.join(__dirname, '../../uploads/generated');
        this.ensureUploadDir();
        
        // 初始化MinIO客户端
        this.initializeMinIOClient();
    }

    // 初始化MinIO客户端
    initializeMinIOClient() {
        try {
            // 从环境变量读取MinIO配置
            const endpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9001';
            const accessKey = process.env.MINIO_ACCESS_KEY_ID || 'minioadmin';
            const secretKey = process.env.MINIO_SECRET_ACCESS_KEY || 'minioadmin123';
            const bucketName = process.env.MINIO_BUCKET_NAME || 'tattoo';
            const useSSL = process.env.MINIO_USE_SSL === 'true';
            
            // 解析endpoint获取host和port
            const url = new URL(endpoint);
            const host = url.hostname;
            const port = parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80);
            
            // 创建MinIO客户端
            this.minioClient = new Client({
                endPoint: host,
                port: port,
                useSSL: useSSL,
                accessKey: accessKey,
                secretKey: secretKey
            });
            
            this.minioBucketName = bucketName;
            console.log(`MinIO客户端初始化成功: ${endpoint}/${bucketName}`);
        } catch (error) {
            console.error('MinIO客户端初始化失败:', error.message);
            this.minioClient = null;
        }
    }

    // 异步生成纹身图像（启动任务，立即返回）
    async generateTattooAsync(params) {
        try {
            // 验证必需参数
            if (!params.prompt) {
                throw new Error('Prompt is required');
            }

            // 检查 Replicate API Token
            if (!process.env.REPLICATE_API_TOKEN) {
                throw new Error('REPLICATE_API_TOKEN environment variable is required');
            }

            // 合并参数
            const input = {
                ...this.defaultParams,
                ...params,
                // 确保 prompt 包含 TOK 关键词以激活模型特性
                prompt: await this.enhancePrompt(params.prompt, params.style, params.isColor, params.styleNote)
            };

            // 验证参数范围
            this.validateParams(input);

            // 验证用户积分是否足够
            await this.validateUserCredits(params.userId, input.num_outputs);

            // 启动异步生成任务
            const result = await this.startAsyncGeneration(input);
            
            return this.formatResponse(true, result, 'Generation task started successfully');
        } catch (error) {
            throw new Error(`Start generation task failed: ${error.message}`);
        }
    }

    // 检测文本是否主要包含非英文字符
    isNonEnglish(text) {
        // 检测中文字符
        const chineseRegex = /[\u4e00-\u9fff]/g;
        const chineseChars = (text.match(chineseRegex) || []).length;
        
        // 检测日文字符（平假名、片假名、汉字）
        const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/g;
        const japaneseChars = (text.match(japaneseRegex) || []).length;
        
        // 检测韩文字符
        const koreanRegex = /[\uac00-\ud7af]/g;
        const koreanChars = (text.match(koreanRegex) || []).length;
        
        // 检测阿拉伯文字符
        const arabicRegex = /[\u0600-\u06ff]/g;
        const arabicChars = (text.match(arabicRegex) || []).length;
        
        // 检测俄文字符
        const russianRegex = /[\u0400-\u04ff]/g;
        const russianChars = (text.match(russianRegex) || []).length;
        
        // 检测法文/德文等特殊字符
        const europeanRegex = /[àáâäçèéêëìíîïñòóôöùúûüýÿæœßÀÁÂÄÇÈÉÊËÌÍÎÏÑÒÓÔÖÙÚÛÜÝŸÆŒ]/g;
        const europeanChars = (text.match(europeanRegex) || []).length;
        
        const totalChars = text.replace(/\s/g, '').length;
        const nonEnglishChars = chineseChars + japaneseChars + koreanChars + arabicChars + russianChars + europeanChars;
        
        return nonEnglishChars > totalChars * 0.2; // 如果非英文字符超过20%，认为需要翻译
    }

    // 使用DeepSeek翻译非英文prompt
    async translatePrompt(prompt) {
        try {
            // 检查是否配置了DeepSeek API Key
            if (!process.env.DEEPSEEK_API_KEY) {
                console.warn('DeepSeek API Key not configured, using original prompt');
                return prompt;
            }

            // 使用axios替代fetch
            const axios = require('axios');
            const response = await axios.post('https://api.deepseek.com/chat/completions', {
                model: 'deepseek-chat',
                messages: [{
                    role: 'user',
                    content: `Translate this tattoo design description to English. Keep it simple, clear, and suitable for AI image generation. Only return the English translation without any explanations:

"${prompt}"`
                }],
                max_tokens: 150,
                temperature: 0.1,
                stream: false
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
                },
                timeout: 30000
            });

            if (response.status !== 200) {
                throw new Error(`DeepSeek API error: ${response.status}`);
            }

            const data = response.data;
            const translatedPrompt = data.choices[0]?.message?.content?.trim();
            
            if (translatedPrompt) {
                console.log(`Translated prompt: ${prompt} -> ${translatedPrompt}`);
                return translatedPrompt;
            }
            
            return prompt; // 翻译失败时返回原prompt
        } catch (error) {
            console.warn('Translation failed:', error.message);
            return prompt; // 翻译失败时返回原prompt
        }
    }

    // 增强提示词，生成专业的纹身设计提示词
    async enhancePrompt(prompt, style, isColor, styleNote) {
        // 如果是非英文prompt，先翻译成英文
        let processedPrompt = prompt;
        if (this.isNonEnglish(prompt)) {
            processedPrompt = await this.translatePrompt(prompt);
        }
        // 处理空的 style 参数
        const hasStyle = style && style.trim() !== '';
        const styleText = hasStyle ? `${style} style` : 'professional tattoo';
        const artStyleText = hasStyle ? `- Art style: ${style}` : '- Art style: Professional tattoo design';
        
        // 处理空的 styleNote 参数
        const hasStyleNote = styleNote && styleNote.trim() !== '';
        const styleNotesSection = hasStyleNote ? `\nAdditional style notes:\n${styleNote}` : '';
        
        // 优化颜色描述和指令
        let colorInstructions;
        if (isColor) {
            colorInstructions = `- IMPORTANT: Full color tattoo with BRIGHT, VIBRANT, SATURATED colors
- Rich color palette with strong saturation and contrast
- Colorful design with multiple distinct colors
- Vivid and eye-catching color scheme
- NEVER use black and grey only - must include bright colors`;
        } else {
            colorInstructions = `- IMPORTANT: Black and grey monochrome tattoo ONLY
- Use only black ink with grey shading and highlights
- NO color whatsoever - pure black and grey design
- Focus on detailed shading, gradients, and contrast
- Traditional black and grey tattoo style`;
        }
        
        const enhancedPrompt = `Create a ${styleText} tattoo design based on: "${processedPrompt}"

Style specifications:
${artStyleText}
${colorInstructions}
- Format: Clean tattoo design suitable for transfer to skin
- Composition: Well-balanced and proportioned for tattoo application

Technical requirements:
- High contrast and clear line definition
- Appropriate level of detail for tattoo medium
- Consider how the design will age over time
- Ensure all elements are tattoo-appropriate
${isColor ? '- Emphasize the vibrant colors throughout the entire design' : '- Focus on rich black and grey tonal variations'}

The design should be professional quality, original, and ready for use as a tattoo reference. Focus on creating bold, clean artwork that will translate well from digital design to actual skin application.${styleNotesSection}`;

        return enhancedPrompt;
    }

    // 验证参数
    validateParams(params) {
        const errors = [];

        // 验证尺寸
        if (params.width && (params.width < 256 || params.width > 2048)) {
            errors.push('Width must be between 256 and 2048');
        }
        if (params.height && (params.height < 256 || params.height > 2048)) {
            errors.push('Height must be between 256 and 2048');
        }

        // 验证输出数量
        if (params.num_outputs && (params.num_outputs < 1 || params.num_outputs > 4)) {
            errors.push('Number of outputs must be between 1 and 4');
        }

        // 验证引导尺度
        if (params.guidance_scale && (params.guidance_scale < 1 || params.guidance_scale > 20)) {
            errors.push('Guidance scale must be between 1 and 20');
        }

        // 验证推理步数
        if (params.num_inference_steps && (params.num_inference_steps < 1 || params.num_inference_steps > 100)) {
            errors.push('Number of inference steps must be between 1 and 100');
        }

        // 验证LoRA缩放
        if (params.lora_scale && (params.lora_scale < 0 || params.lora_scale > 1)) {
            errors.push('LoRA scale must be between 0 and 1');
        }

        // 验证高噪声比例
        if (params.high_noise_frac && (params.high_noise_frac < 0 || params.high_noise_frac > 1)) {
            errors.push('High noise fraction must be between 0 and 1');
        }

        if (errors.length > 0) {
            throw new Error(`Parameter validation failed: ${errors.join(', ')}`);
        }
    }

    // 验证用户积分是否足够
    async validateUserCredits(userId, numOutputs) {
        if (!userId) {
            throw new Error('User ID is required for credit validation');
        }

        if (!this.userModel) {
            throw new Error('User model not provided - cannot validate credits');
        }

        try {
            // 查询用户信息
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // 计算所需积分（1个输出图片需要1个积分）
            const requiredCredits = numOutputs || 1;
            
            // 检查用户积分是否足够
            if (user.credits < requiredCredits) {
                throw new Error(`Insufficient credits. Required: ${requiredCredits}, Available: ${user.credits}`);
            }

            console.log(`User ${userId} has sufficient credits: ${user.credits} >= ${requiredCredits}`);
            return true;
        } catch (error) {
            throw new Error(`Credit validation failed: ${error.message}`);
        }
    }

    // 扣除用户积分
    async deductUserCredits(userId, imageCount) {
        if (!userId || !imageCount) {
            throw new Error('User ID and image count are required for credit deduction');
        }

        if (!this.userModel) {
            throw new Error('User model not provided - cannot deduct credits');
        }

        try {
            // 查询用户信息
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // 计算要扣除的积分（每张图片1积分）
            const creditsToDeduct = imageCount;
            
            // 再次检查用户积分是否足够（防止并发问题）
            if (user.credits < creditsToDeduct) {
                throw new Error(`Insufficient credits for deduction. Required: ${creditsToDeduct}, Available: ${user.credits}`);
            }

            // 扣除积分
            const newCredits = user.credits - creditsToDeduct;
            await this.userModel.updateById(
                userId,
                { credits: newCredits }
            );

            console.log(`Deducted ${creditsToDeduct} credits from user ${userId}. New balance: ${newCredits}`);
            return { 
                deductedCredits: creditsToDeduct, 
                newBalance: newCredits, 
                previousBalance: user.credits 
            };
        } catch (error) {
            throw new Error(`Credit deduction failed: ${error.message}`);
        }
    }

    // 启动异步生成任务
    async startAsyncGeneration(input) {
        try {
            // 详细检查环境变量
            if (!process.env.REPLICATE_API_TOKEN) {
                throw new Error('REPLICATE_API_TOKEN environment variable is not set');
            }

            if (!process.env.REPLICATE_API_TOKEN.startsWith('r8_')) {
                throw new Error('REPLICATE_API_TOKEN appears to be invalid (should start with r8_)');
            }

            // 检查是否安装了replicate包
            let Replicate;
            try {
                Replicate = require('replicate');
            } catch (error) {
                throw new Error('Replicate package not found. Please install: npm install replicate');
            }

            console.log('Creating Replicate client...');
            
            // 配置Replicate客户端，添加fetch选项解决网络问题
            const replicateConfig = {
                auth: process.env.REPLICATE_API_TOKEN,
                // 添加自定义fetch配置
                fetch: (url, options = {}) => {
                    // 使用node-fetch替代内置fetch
                    const fetch = require('node-fetch');
                    
                    // 添加超时和重试逻辑
                    const timeout = 30000; // 30秒超时
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), timeout);
                    
                    return fetch(url, {
                        ...options,
                        signal: controller.signal,
                        headers: {
                            'User-Agent': 'tattoo-generator/1.0',
                            ...options.headers
                        }
                    }).finally(() => {
                        clearTimeout(timeoutId);
                    });
                }
            };
            
            const replicate = new Replicate(replicateConfig);

            console.log('Model version:', this.modelVersion);
            console.log('Input parameters:', JSON.stringify(input, null, 2));

            // 创建预测任务（异步）
            console.log('Creating prediction...');
            const prediction = await replicate.predictions.create({
                version: this.modelVersion.split(':')[1], // 只需要版本ID部分
                input: input
            });

            console.log('Prediction created successfully:', prediction.id);

            return {
                id: prediction.id,
                status: prediction.status,
                input: prediction.input,
                output: prediction.output,
                error: prediction.error,
                logs: prediction.logs,
                created_at: prediction.created_at,
                started_at: prediction.started_at,
                completed_at: prediction.completed_at,
                urls: prediction.urls
            };
        } catch (error) {
            console.error('Replicate API error details:', {
                message: error.message,
                code: error.code,
                status: error.status,
                response: error.response?.data || error.response,
                stack: error.stack
            });

            if (error.message.includes('Replicate package not found')) {
                throw error;
            }

            // 提供更具体的错误信息
            if (error.message.includes('fetch failed')) {
                throw new Error(`Network connection failed. Please check: 1) Internet connectivity 2) Replicate API status 3) Firewall settings. Original error: ${error.message}`);
            }

            if (error.message.includes('Unauthorized') || error.message.includes('401')) {
                throw new Error(`Replicate API authentication failed. Please check your REPLICATE_API_TOKEN. Original error: ${error.message}`);
            }

            if (error.message.includes('Not Found') || error.message.includes('404')) {
                throw new Error(`Model not found. Please check the model version: ${this.modelVersion}. Original error: ${error.message}`);
            }

            throw new Error(`Replicate API call failed: ${error.message}`);
        }
    }

    // 获取生成任务状态
    async getGenerationStatus(predictionId) {
        try {
            if (!predictionId) {
                throw new Error('Prediction ID is required');
            }

            if (!process.env.REPLICATE_API_TOKEN) {
                throw new Error('REPLICATE_API_TOKEN environment variable is required');
            }

            let Replicate;
            try {
                Replicate = require('replicate');
            } catch (error) {
                throw new Error('Replicate package not found. Please install: npm install replicate');
            }

            const replicate = new Replicate({
                auth: process.env.REPLICATE_API_TOKEN,
            });

            const prediction = await replicate.predictions.get(predictionId);
            
            // 格式化状态响应
            const statusInfo = {
                id: prediction.id,
                status: prediction.status,
                input: prediction.input,
                output: prediction.output,
                error: prediction.error,
                logs: prediction.logs,
                created_at: prediction.created_at,
                started_at: prediction.started_at,
                completed_at: prediction.completed_at,
                progress: this.calculateProgress(prediction.status, prediction.logs),
                urls: prediction.urls
            };
            
            return this.formatResponse(true, statusInfo, 'Status retrieved successfully');
        } catch (error) {
            throw new Error(`Get generation status failed: ${error.message}`);
        }
    }

    // 计算生成进度
    calculateProgress(status, logs = '') {
        switch (status) {
            case 'starting':
                return { percentage: 5, message: 'Initializing...' };
            case 'processing':
                // 尝试从日志中解析进度
                const logMatch = logs.match(/(\d+)%/);
                if (logMatch) {
                    const percentage = Math.min(95, Math.max(10, parseInt(logMatch[1])));
                    return { percentage, message: 'Generating image...' };
                }
                return { percentage: 50, message: 'Processing...' };
            case 'succeeded':
                return { percentage: 100, message: 'Completed successfully' };
            case 'failed':
                return { percentage: 0, message: 'Generation failed' };
            case 'canceled':
                return { percentage: 0, message: 'Generation canceled' };
            default:
                return { percentage: 0, message: 'Unknown status' };
        }
    }

    // 完成异步生成任务的后处理（下载保存）
    async completeGeneration(predictionId, originalParams = {}) {
        try {
            // 获取生成状态
            const statusResponse = await this.getGenerationStatus(predictionId);
            const prediction = statusResponse.data;

            if (prediction.status !== 'succeeded') {
                throw new Error(`Generation not completed. Status: ${prediction.status}`);
            }

            if (!prediction.output || !Array.isArray(prediction.output)) {
                throw new Error('No output images found');
            }

            // 生成批次ID（如果没有提供）
            const batchId = originalParams.batchId || this.generateId();

            // 下载并保存生成的图片
            const savedImages = await this.downloadAndSaveImages(prediction.output, prediction.id, batchId);
            
            // 更新结果，包含本地文件路径和批次ID
            prediction.localImages = savedImages;
            prediction.batchId = batchId;
            
            // 保存到数据库
            let savedToDb = null;
            if (this.imageModel && savedImages.length > 0) {
                savedToDb = await this.saveToDatabase(prediction, savedImages, { ...originalParams, batchId });
            }

            // 扣除用户积分（根据成功生成的图片数量）
            if (originalParams.userId && savedImages.length > 0) {
                await this.deductUserCredits(originalParams.userId, savedImages.length);
            }
            
            return this.formatResponse(true, { localImages: savedToDb }, 'Generation completed and saved successfully');
        } catch (error) {
            throw new Error(`Complete generation failed: ${error.message}`);
        }
    }

    // 生成唯一ID
    generateId() {
        return uuidv4();
    }

    // 标准化响应格式
    formatResponse(success, data = null, message = '', errors = []) {
        return {
            status: success ? 'success' : 'error',
            message,
            data,
            ...(errors.length > 0 && { errors })
        };
    }

    // 确保上传目录存在
    ensureUploadDir() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
            console.log(`Created upload directory: ${this.uploadDir}`);
        }
    }

    // 下载并保存图片到MinIO
    async downloadAndSaveImages(imageUrls, generationId, batchId) {
        if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
            throw new Error('No image URLs provided');
        }

        if (!this.minioClient) {
            throw new Error('MinIO client not initialized');
        }

        const savedImages = [];

        // 确保存储桶存在
        try {
            const bucketExists = await this.minioClient.bucketExists(this.minioBucketName);
            if (!bucketExists) {
                await this.minioClient.makeBucket(this.minioBucketName, 'us-east-1');
                console.log(`创建MinIO存储桶: ${this.minioBucketName}`);
            }
        } catch (error) {
            throw new Error(`MinIO存储桶检查失败: ${error.message}`);
        }

        for (let i = 0; i < imageUrls.length; i++) {
            const imageUrl = imageUrls[i];
            const filename = `generated/${batchId}_${generationId}_${i}.png`;

            try {
                // 下载图片
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
                }

                // 获取图片数据
                const imageBuffer = await response.buffer();
                const imageSize = imageBuffer.length;

                // 上传到MinIO
                await this.minioClient.putObject(
                    this.minioBucketName,
                    filename,
                    imageBuffer,
                    imageSize,
                    {
                        'Content-Type': 'image/png',
                        'X-Amz-Meta-Generation-Id': generationId,
                        'X-Amz-Meta-Batch-Id': batchId
                    }
                );

                // 构建后端服务访问URL（通过/images路由访问MinIO图片）
                const minioPath = `images/${filename}`;
                
                savedImages.push({
                    filename: filename,
                    minioPath: minioPath,
                    originalUrl: imageUrl,
                    size: imageSize,
                    batchId: batchId,
                    storage: 'minio'
                });

                console.log(`Image uploaded to MinIO: ${filename}`);
            } catch (error) {
                console.error(`Failed to save image ${i} to MinIO:`, error.message);
                // 继续处理其他图片，不中断整个流程
                savedImages.push({
                    error: error.message,
                    originalUrl: imageUrl
                });
            }
        }

        return savedImages;
    }

    // 保存生成结果到数据库
    async saveToDatabase(generationResult, savedImages, originalParams) {
        if (!this.imageModel) {
            throw new Error('Image model not provided - cannot save to database');
        }

        const savedRecords = [];

        for (let i = 0; i < savedImages.length; i++) {
            const savedImage = savedImages[i];
            
            // 跳过下载失败的图片
            if (savedImage.error) {
                continue;
            }

            try {
                // 构建数据库记录数据
                const imageData = {
                    id: this.generateId(),
                    name: null,
                    slug: `generated-tattoo-${generationResult.id}-${i}`,
                    tattooUrl: savedImage.minioPath || savedImage.relativePath, // 使用MinIO路径或相对路径
                    scourceUrl: savedImage.originalUrl, // 原始Replicate URL
                    title: null,
                    description: null,
                    type: 'text2image', // 生成类型
                    styleId: originalParams.styleId || null, // 如果有样式ID
                    isColor: originalParams.isColor !== undefined ? originalParams.isColor : false,
                    isPublic: originalParams.isPublic !== undefined ? originalParams.isPublic : false, // 使用传入的参数或默认不公开
                    isOnline: false, // 默认不上线
                    hotness: 0,
                    prompt: JSON.stringify({
                        en: originalParams.prompt,
                        zh: originalParams.prompt
                    }),
                    userId: originalParams.userId || null, // 如果有用户ID
                    categoryId: originalParams.categoryId || null, // 如果有分类ID
                    batchId: originalParams.batchId,
                    additionalInfo: null
                };

                // 保存到数据库
                const savedRecord = await this.imageModel.create(imageData);
                savedRecords.push(savedRecord);

                console.log(`Image saved to database: ${savedRecord.id}`);
            } catch (error) {
                console.error(`Failed to save image ${i} to database:`, error.message);
                savedRecords.push({
                    error: error.message,
                    localImage: savedImage
                });
            }
        }

        return savedRecords;
    }
}

module.exports = ImageGenerateService;