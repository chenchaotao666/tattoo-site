/**
 * Three.js 3D场景管理模块
 * 负责3D场景的初始化、渲染和控制
 */

import * as THREE from 'three';

interface SceneConfig {
  width: number;
  height: number;
  backgroundColor?: number;
  antialias?: boolean;
  alpha?: boolean;
}

interface CameraSettings {
  fov: number;
  aspect: number;
  near: number;
  far: number;
  position: { x: number; y: number; z: number };
}

interface LightSettings {
  ambientColor: number;
  ambientIntensity: number;
  directionalColor: number;
  directionalIntensity: number;
  directionalPosition: { x: number; y: number; z: number };
}

class ThreeScene {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement | null = null;
  private animationId: number | null = null;
  
  // 场景对象
  private meshRef: THREE.Mesh | null = null;
  private materialRef: THREE.ShaderMaterial | null = null;
  
  // 配置
  private config: SceneConfig;
  private isInitialized: boolean = false;

  constructor(config: SceneConfig) {
    this.config = {
      backgroundColor: 0xf8f9fa,
      antialias: true,
      alpha: true,
      ...config
    };

    // 初始化场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.backgroundColor!);

    // 初始化相机 (使用正交相机以保持2D效果)
    this.camera = new THREE.OrthographicCamera(
      -this.config.width / 2,   // left
      this.config.width / 2,    // right
      this.config.height / 2,   // top
      -this.config.height / 2,  // bottom
      0.1,                      // near
      100                       // far
    );
    this.camera.position.z = 2.5;

    // 初始化渲染器
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: this.config.antialias,
      alpha: this.config.alpha 
    });
    this.renderer.setSize(this.config.width, this.config.height);
    this.renderer.setClearColor(this.config.backgroundColor!);

    // 设置光照
    this.setupLights();
  }

  /**
   * 设置场景光照
   */
  private setupLights(settings?: Partial<LightSettings>): void {
    const lightConfig: LightSettings = {
      ambientColor: 0xffffff,
      ambientIntensity: 0.8,
      directionalColor: 0xffffff,
      directionalIntensity: 0.5,
      directionalPosition: { x: 5, y: 5, z: 5 },
      ...settings
    };

    // 环境光
    const ambientLight = new THREE.AmbientLight(
      lightConfig.ambientColor, 
      lightConfig.ambientIntensity
    );
    this.scene.add(ambientLight);

    // 方向光
    const directionalLight = new THREE.DirectionalLight(
      lightConfig.directionalColor, 
      lightConfig.directionalIntensity
    );
    directionalLight.position.set(
      lightConfig.directionalPosition.x,
      lightConfig.directionalPosition.y,
      lightConfig.directionalPosition.z
    );
    this.scene.add(directionalLight);
  }

  /**
   * 挂载到DOM容器
   */
  mount(container: HTMLElement): void {
    this.container = container;
    container.appendChild(this.renderer.domElement);
    this.isInitialized = true;

    // 开始渲染循环
    this.startRenderLoop();
  }

  /**
   * 开始渲染循环
   */
  private startRenderLoop(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.render();
    };
    animate();
  }

  /**
   * 渲染场景
   */
  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * 更新场景尺寸
   */
  updateSize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;

    // 更新相机
    this.camera.left = -width / 2;
    this.camera.right = width / 2;
    this.camera.top = height / 2;
    this.camera.bottom = -height / 2;
    this.camera.updateProjectionMatrix();

    // 更新渲染器
    this.renderer.setSize(width, height);
  }

  /**
   * 创建平面几何体
   */
  createPlane(width: number, height: number): THREE.PlaneGeometry {
    return new THREE.PlaneGeometry(width, height, 300, 300);
  }

  /**
   * 创建基础平面
   */
  createBasePlane(imageAspectRatio: number): void {
    // 计算平面尺寸
    const planeWidth = 2 * imageAspectRatio;
    const planeHeight = 2;

    // 创建几何体
    const geometry = this.createPlane(planeWidth, planeHeight);

    // 创建基础材质（稍后会被着色器材质替换）
    const material = new THREE.MeshBasicMaterial({ 
      transparent: true,
      opacity: 0 
    });

    // 创建网格
    if (this.meshRef) {
      this.scene.remove(this.meshRef);
    }

    this.meshRef = new THREE.Mesh(geometry, material);
    this.meshRef.position.z = 0;
    this.scene.add(this.meshRef);
  }

  /**
   * 设置着色器材质
   */
  setShaderMaterial(material: THREE.ShaderMaterial): void {
    if (this.meshRef) {
      this.meshRef.material = material;
      this.materialRef = material;
    }
  }

  /**
   * 更新材质uniforms
   */
  updateMaterialUniforms(uniforms: Record<string, any>): void {
    if (this.materialRef) {
      Object.keys(uniforms).forEach(key => {
        if (this.materialRef!.uniforms[key]) {
          if (key === 'overlayOffset' && Array.isArray(uniforms[key])) {
            this.materialRef!.uniforms[key].value.set(...uniforms[key]);
          } else {
            this.materialRef!.uniforms[key].value = uniforms[key];
          }
        }
      });
    }
  }

  /**
   * 获取渲染器画布元素
   */
  getCanvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  /**
   * 获取场景对象
   */
  getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * 获取相机对象
   */
  getCamera(): THREE.OrthographicCamera {
    return this.camera;
  }

  /**
   * 获取渲染器对象
   */
  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  /**
   * 获取网格对象
   */
  getMesh(): THREE.Mesh | null {
    return this.meshRef;
  }

  /**
   * 获取材质对象
   */
  getMaterial(): THREE.ShaderMaterial | null {
    return this.materialRef;
  }

  /**
   * 导出场景为图像
   */
  exportAsImage(): string {
    return this.renderer.domElement.toDataURL('image/png', 1.0);
  }

  /**
   * 检查是否已初始化
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * 销毁场景
   */
  dispose(): void {
    // 停止动画循环
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // 清理网格和材质
    if (this.meshRef) {
      this.scene.remove(this.meshRef);
      if (this.meshRef.geometry) {
        this.meshRef.geometry.dispose();
      }
      if (this.meshRef.material) {
        if (Array.isArray(this.meshRef.material)) {
          this.meshRef.material.forEach(material => material.dispose());
        } else {
          this.meshRef.material.dispose();
        }
      }
      this.meshRef = null;
    }

    // 清理渲染器
    if (this.renderer) {
      this.renderer.dispose();
    }

    // 从DOM中移除
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }

    this.isInitialized = false;
  }
}

export { ThreeScene };
export type { SceneConfig, CameraSettings, LightSettings };