/**
 * 纹身着色器材质系统
 * 实现复杂的纹身贴图效果和深度处理
 */

import * as THREE from 'three';

interface ShaderUniforms {
  baseTexture: THREE.Texture | null;
  depthMap: THREE.Texture | null;
  overlayTexture: THREE.Texture | null;
  segmentationMap: THREE.Texture | null;
  eraseMap?: THREE.Texture | null;
  
  // 变换参数
  overlayScale: number;
  overlayRotation: number;
  overlayOffset: [number, number];
  overlayOpacity: number;
  overlayAspectRatio: number;
  
  // 深度和透视参数
  depthStrength: number;
  maxDepthOpaque: number;
  perspectiveK: number;
  depthMapResolution: [number, number];
  
  // 视觉效果参数
  overlayContrast: number;
  hintOutsideSegment: number;
  applyMultiplyEffect: boolean;
  includeBase: boolean;
  overlayBlackAndWhite: boolean;
  showEraseEffect: boolean;
}

class TattooShader {
  private material: THREE.ShaderMaterial | null = null;
  private textureLoader: THREE.TextureLoader;

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
  }

  /**
   * 创建虚拟透明纹理
   */
  private createDummyTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 1, 1);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    return texture;
  }

  /**
   * 顶点着色器代码
   */
  private getVertexShader(): string {
    return `
      varying vec2 vUv;
      varying vec3 vNormal;
      uniform sampler2D depthMap;
      uniform float depthStrength;
      uniform vec2 depthMapResolution;

      void main() {
        vUv = uv;

        // 采样中心和邻近像素的深度值
        float dC = texture2D(depthMap, uv).r;
        float dL = texture2D(depthMap, uv + vec2(-1.0 / depthMapResolution.x, 0.0)).r;
        float dR = texture2D(depthMap, uv + vec2(1.0 / depthMapResolution.x, 0.0)).r;
        float dU = texture2D(depthMap, uv + vec2(0.0, 1.0 / depthMapResolution.y)).r;
        float dD = texture2D(depthMap, uv + vec2(0.0, -1.0 / depthMapResolution.y)).r;

        // 从深度差异计算法向量
        vec3 dx = vec3(2.0 / depthMapResolution.x, 0.0, (dR - dL) * depthStrength);
        vec3 dy = vec3(0.0, 2.0 / depthMapResolution.y, (dU - dD) * depthStrength);
        vec3 normal = normalize(cross(dx, dy));
        vNormal = normal;

        // 仅沿Z轴偏移位置以避免破碎效果
        vec3 displaced = position + vec3(0.0, 0.0, dC * depthStrength);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `;
  }

  /**
   * 片段着色器代码
   */
  private getFragmentShader(): string {
    return `
      varying vec2 vUv;
      uniform sampler2D baseTexture;
      uniform sampler2D overlayTexture;
      uniform sampler2D segmentationMap;
      uniform sampler2D depthMap;
      uniform sampler2D eraseMap;
      
      uniform float overlayScale;
      uniform float overlayRotation;
      uniform vec2 overlayOffset;
      uniform float perspectiveK;
      uniform float overlayOpacity;
      uniform float overlayAspectRatio;
      uniform float hintOutsideSegment;
      uniform float overlayContrast;
      
      uniform bool applyMultiplyEffect;
      uniform bool includeBase;
      uniform bool overlayBlackAndWhite;
      uniform bool showEraseEffect;

      void main() {
        // 调整UV坐标以考虑偏移
        vec2 centeredUv = vUv - 0.5;

        // 首先应用透视缩放
        float depth = texture2D(depthMap, vUv).r;
        // 反转深度，使较近的物体更大，较远的物体更小
        float perspectiveScale = 1.0 / (1.0 + perspectiveK * depth);
        vec2 perspectiveUv = centeredUv * perspectiveScale;

        // 平移到原点，然后旋转和缩放
        vec2 translatedUv = perspectiveUv - overlayOffset;

        // 旋转UV坐标
        float cosTheta = cos(overlayRotation);
        float sinTheta = sin(overlayRotation);
        vec2 rotatedUv = vec2(
          translatedUv.x * cosTheta - translatedUv.y * sinTheta,
          translatedUv.x * sinTheta + translatedUv.y * cosTheta
        );

        // 旋转后应用缩放
        vec2 scaledUv = vec2(rotatedUv.x * overlayAspectRatio, rotatedUv.y);
        vec2 finalUv = scaledUv / overlayScale + 0.5;

        // 采样纹身纹理
        vec4 overlay = vec4(0.0);
        if (finalUv.x >= 0.0 && finalUv.x <= 1.0 && finalUv.y >= 0.0 && finalUv.y <= 1.0) {
          overlay = texture2D(overlayTexture, finalUv);
        }
        overlay.a *= overlayOpacity;

        // 如果需要，转换为灰度
        if (overlayBlackAndWhite) {
          float gray = dot(overlay.rgb, vec3(0.299, 0.587, 0.114));
          overlay.rgb = vec3(gray);
        }

        // 应用对比度
        overlay.rgb = (overlay.rgb - 0.5) * overlayContrast + 0.5;

        // 采样基础纹理
        vec4 base = vec4(1.0, 1.0, 1.0, 1.0); // 默认白色
        if (includeBase) {
          base = texture2D(baseTexture, vUv);
        }

        // 采样分割遮罩
        vec4 seg = texture2D(segmentationMap, vUv);
        float mask = seg.a;

        // 如果启用擦除效果
        if (showEraseEffect && includeBase) {
          vec4 erase = texture2D(eraseMap, vUv);
          overlay.a *= (1.0 - erase.a); // 根据黑色像素应用擦除效果
        }

        // 计算最终颜色
        vec3 finalColor;
        if (includeBase) {
          // 有基础纹理时，基于是否有纹身来决定显示方式
          if (overlay.a > 0.0) {
            // 有纹身时进行混合
            vec3 multiplied = base.rgb * overlay.rgb;
            finalColor = mix(
              base.rgb, 
              applyMultiplyEffect ? multiplied : overlay.rgb, 
              overlay.a * (mask > 0.0 ? mask : hintOutsideSegment)
            );
          } else {
            // 没有纹身时直接显示基础图像
            finalColor = base.rgb;
          }
        } else {
          // 没有基础纹理时显示纹身颜色
          finalColor = overlay.rgb;
        }

        gl_FragColor = vec4(
          finalColor, 
          includeBase ? base.a : (overlay.a * (mask > 0.0 ? mask : hintOutsideSegment))
        );
      }
    `;
  }

  /**
   * 创建着色器材质
   */
  createShaderMaterial(uniforms: Partial<ShaderUniforms>): THREE.ShaderMaterial {
    const defaultUniforms: Record<string, any> = {
      baseTexture: { value: null },
      depthMap: { value: this.createDummyTexture() },
      overlayTexture: { value: this.createDummyTexture() },
      segmentationMap: { value: this.createDummyTexture() },
      eraseMap: { value: this.createDummyTexture() },
      
      overlayScale: { value: 1.0 },
      overlayRotation: { value: 0.0 },
      overlayOffset: { value: new THREE.Vector2(0, 0) },
      overlayOpacity: { value: 0.8 },
      overlayAspectRatio: { value: 1.0 },
      
      depthStrength: { value: 0.3 },
      maxDepthOpaque: { value: 0.0 },
      perspectiveK: { value: 1.4 },
      depthMapResolution: { value: new THREE.Vector2(512, 512) },
      
      overlayContrast: { value: 1.3 },
      hintOutsideSegment: { value: 0.0 },
      applyMultiplyEffect: { value: true },
      includeBase: { value: true },
      overlayBlackAndWhite: { value: false },
      showEraseEffect: { value: false }
    };

    // 更新uniforms
    Object.keys(uniforms).forEach(key => {
      if (defaultUniforms[key]) {
        if (key === 'overlayOffset' && Array.isArray(uniforms[key as keyof ShaderUniforms])) {
          const offset = uniforms[key as keyof ShaderUniforms] as [number, number];
          defaultUniforms[key].value.set(offset[0], offset[1]);
        } else if (key === 'depthMapResolution' && Array.isArray(uniforms[key as keyof ShaderUniforms])) {
          const resolution = uniforms[key as keyof ShaderUniforms] as [number, number];
          defaultUniforms[key].value.set(resolution[0], resolution[1]);
        } else {
          defaultUniforms[key].value = uniforms[key as keyof ShaderUniforms];
        }
      }
    });

    this.material = new THREE.ShaderMaterial({
      uniforms: defaultUniforms,
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(),
      transparent: true,
      side: THREE.DoubleSide
    });

    return this.material;
  }

  /**
   * 加载纹理
   */
  async loadTexture(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          // 设置纹理过滤器
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          resolve(texture);
        },
        undefined,
        (error) => reject(new Error(`Failed to load texture: ${error}`))
      );
    });
  }

  /**
   * 批量加载纹理
   */
  async loadTextures(urls: {
    baseTexture?: string;
    depthMap?: string;
    overlayTexture?: string;
    segmentationMap?: string;
    eraseMap?: string;
  }): Promise<Record<string, THREE.Texture>> {
    const promises: Promise<[string, THREE.Texture]>[] = [];

    Object.entries(urls).forEach(([key, url]) => {
      if (url) {
        promises.push(
          this.loadTexture(url).then(texture => [key, texture] as [string, THREE.Texture])
        );
      }
    });

    const results = await Promise.all(promises);
    const textures: Record<string, THREE.Texture> = {};
    
    results.forEach(([key, texture]) => {
      textures[key] = texture;
    });

    return textures;
  }

  /**
   * 更新材质uniforms
   */
  updateUniforms(uniforms: Partial<ShaderUniforms>): void {
    if (!this.material) return;

    Object.entries(uniforms).forEach(([key, value]) => {
      if (this.material!.uniforms[key]) {
        if (key === 'overlayOffset' && Array.isArray(value)) {
          this.material!.uniforms[key].value.set(value[0], value[1]);
        } else if (key === 'depthMapResolution' && Array.isArray(value)) {
          this.material!.uniforms[key].value.set(value[0], value[1]);
        } else {
          this.material!.uniforms[key].value = value;
        }
      }
    });
  }

  /**
   * 获取材质对象
   */
  getMaterial(): THREE.ShaderMaterial | null {
    return this.material;
  }

  /**
   * 销毁材质
   */
  dispose(): void {
    if (this.material) {
      // 销毁所有纹理
      Object.values(this.material.uniforms).forEach(uniform => {
        if (uniform.value && uniform.value.isTexture) {
          uniform.value.dispose();
        }
      });
      
      // 销毁材质
      this.material.dispose();
      this.material = null;
    }
  }
}

export { TattooShader };
export type { ShaderUniforms };