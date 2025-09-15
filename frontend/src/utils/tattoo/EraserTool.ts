/**
 * 擦除工具和交互控制模块
 * 实现纹身的精细擦除和各种交互功能
 */

interface EraserSettings {
  size: number;
  hardness: number;
  opacity: number;
  flow: number;
}

interface TouchGesture {
  scale: number;
  rotation: number;
  translation: { x: number; y: number };
}

interface InteractionHandlers {
  onDragStart?: (position: { x: number; y: number }) => void;
  onDragMove?: (delta: { x: number; y: number }) => void;
  onDragEnd?: () => void;
  onScaleChange?: (scale: number) => void;
  onRotationChange?: (rotation: number) => void;
}

class EraserTool {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private eraserCanvas: HTMLCanvasElement;
  private eraserCtx: CanvasRenderingContext2D;
  
  private settings: EraserSettings;
  private isErasing: boolean = false;
  private lastPosition: { x: number; y: number } | null = null;
  
  // 笔刷路径记录
  private strokePaths: Array<{ x: number; y: number }[]> = [];
  private currentStroke: { x: number; y: number }[] = [];

  constructor(canvas: HTMLCanvasElement, settings: Partial<EraserSettings> = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // 创建擦除专用画布
    this.eraserCanvas = document.createElement('canvas');
    this.eraserCanvas.width = canvas.width;
    this.eraserCanvas.height = canvas.height;
    this.eraserCtx = this.eraserCanvas.getContext('2d')!;
    
    this.settings = {
      size: 20,
      hardness: 0.8,
      opacity: 1.0,
      flow: 1.0,
      ...settings
    };

    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 鼠标事件
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

    // 触摸事件
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  /**
   * 鼠标按下事件处理
   */
  private handleMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.startErasing(this.getMousePosition(event));
  }

  /**
   * 鼠标移动事件处理
   */
  private handleMouseMove(event: MouseEvent): void {
    if (this.isErasing) {
      event.preventDefault();
      this.continueErasing(this.getMousePosition(event));
    }
  }

  /**
   * 鼠标释放事件处理
   */
  private handleMouseUp(): void {
    this.stopErasing();
  }

  /**
   * 触摸开始事件处理
   */
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.startErasing(this.getTouchPosition(touch));
    }
  }

  /**
   * 触摸移动事件处理
   */
  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (this.isErasing && event.touches.length === 1) {
      const touch = event.touches[0];
      this.continueErasing(this.getTouchPosition(touch));
    }
  }

  /**
   * 触摸结束事件处理
   */
  private handleTouchEnd(): void {
    this.stopErasing();
  }

  /**
   * 获取鼠标相对于画布的位置
   */
  private getMousePosition(event: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  /**
   * 获取触摸相对于画布的位置
   */
  private getTouchPosition(touch: Touch): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }

  /**
   * 开始擦除
   */
  private startErasing(position: { x: number; y: number }): void {
    this.isErasing = true;
    this.lastPosition = position;
    this.currentStroke = [position];
    
    // 绘制起始点
    this.drawEraserStroke(position, position);
  }

  /**
   * 继续擦除
   */
  private continueErasing(position: { x: number; y: number }): void {
    if (!this.isErasing || !this.lastPosition) return;
    
    this.currentStroke.push(position);
    this.drawEraserStroke(this.lastPosition, position);
    this.lastPosition = position;
  }

  /**
   * 停止擦除
   */
  private stopErasing(): void {
    if (this.isErasing && this.currentStroke.length > 0) {
      this.strokePaths.push([...this.currentStroke]);
      this.currentStroke = [];
    }
    
    this.isErasing = false;
    this.lastPosition = null;
  }

  /**
   * 绘制擦除笔触
   */
  private drawEraserStroke(from: { x: number; y: number }, to: { x: number; y: number }): void {
    const ctx = this.ctx;
    
    // 设置合成模式为擦除
    ctx.globalCompositeOperation = 'destination-out';
    
    // 创建渐变笔刷效果
    if (this.settings.hardness < 1.0) {
      const gradient = ctx.createRadialGradient(
        to.x, to.y, 0,
        to.x, to.y, this.settings.size
      );
      
      const coreOpacity = this.settings.opacity * this.settings.flow;
      const edgeOpacity = coreOpacity * this.settings.hardness;
      
      gradient.addColorStop(0, `rgba(0, 0, 0, ${coreOpacity})`);
      gradient.addColorStop(this.settings.hardness, `rgba(0, 0, 0, ${edgeOpacity})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = `rgba(0, 0, 0, ${this.settings.opacity * this.settings.flow})`;
    }

    // 绘制线条
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.lineWidth = this.settings.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 绘制端点
    ctx.beginPath();
    ctx.arc(to.x, to.y, this.settings.size / 2, 0, Math.PI * 2);
    ctx.fill();

    // 恢复合成模式
    ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * 创建软笔刷效果
   */
  private createSoftBrush(x: number, y: number): void {
    const gradient = this.ctx.createRadialGradient(
      x, y, 0,
      x, y, this.settings.size
    );

    const centerAlpha = this.settings.opacity * this.settings.flow;
    const edgeAlpha = centerAlpha * (1 - this.settings.hardness);

    gradient.addColorStop(0, `rgba(0, 0, 0, ${centerAlpha})`);
    gradient.addColorStop(0.7, `rgba(0, 0, 0, ${edgeAlpha})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.settings.size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * 更新擦除器设置
   */
  updateSettings(newSettings: Partial<EraserSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * 获取当前设置
   */
  getSettings(): EraserSettings {
    return { ...this.settings };
  }

  /**
   * 撤销上一步操作
   */
  undo(): void {
    if (this.strokePaths.length > 0) {
      this.strokePaths.pop();
      this.redrawCanvas();
    }
  }

  /**
   * 清除所有擦除操作
   */
  clearAll(): void {
    this.strokePaths = [];
    this.redrawCanvas();
  }

  /**
   * 重绘整个画布
   */
  private redrawCanvas(): void {
    // 这里应该重新应用所有擦除操作
    // 实际实现需要保存原始图像状态
    this.ctx.globalCompositeOperation = 'source-over';
    // 重绘原始内容...
    
    // 重新应用所有擦除路径
    this.ctx.globalCompositeOperation = 'destination-out';
    this.strokePaths.forEach(stroke => {
      if (stroke.length > 1) {
        for (let i = 1; i < stroke.length; i++) {
          this.drawEraserStroke(stroke[i - 1], stroke[i]);
        }
      } else if (stroke.length === 1) {
        this.drawEraserStroke(stroke[0], stroke[0]);
      }
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * 获取擦除遮罩
   */
  getEraseMask(): string {
    // 创建黑白遮罩
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = this.canvas.width;
    maskCanvas.height = this.canvas.height;
    const maskCtx = maskCanvas.getContext('2d')!;

    // 填充白色背景
    maskCtx.fillStyle = 'white';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    // 绘制黑色擦除区域
    maskCtx.globalCompositeOperation = 'destination-out';
    this.strokePaths.forEach(stroke => {
      if (stroke.length > 1) {
        maskCtx.beginPath();
        maskCtx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
          maskCtx.lineTo(stroke[i].x, stroke[i].y);
        }
        maskCtx.lineWidth = this.settings.size;
        maskCtx.lineCap = 'round';
        maskCtx.lineJoin = 'round';
        maskCtx.stroke();
      }
    });

    return maskCanvas.toDataURL();
  }

  /**
   * 导出当前画布状态
   */
  exportCanvas(): string {
    return this.canvas.toDataURL('image/png', 1.0);
  }

  /**
   * 销毁擦除工具
   */
  dispose(): void {
    // 移除事件监听器
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
  }
}

/**
 * 手势交互控制器
 */
class GestureController {
  private element: HTMLElement;
  private handlers: InteractionHandlers;
  
  // 拖拽状态
  private isDragging: boolean = false;
  private dragStartPosition: { x: number; y: number } = { x: 0, y: 0 };
  private dragStartOffset: { x: number; y: number } = { x: 0, y: 0 };

  // 触摸状态
  private touches: Touch[] = [];
  private lastDistance: number | null = null;
  private lastAngle: number | null = null;

  constructor(element: HTMLElement, handlers: InteractionHandlers = {}) {
    this.element = element;
    this.handlers = handlers;
    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 鼠标事件
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // 触摸事件
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    window.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  /**
   * 鼠标按下处理
   */
  private handleMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.dragStartPosition = { x: event.clientX, y: event.clientY };
    
    if (this.handlers.onDragStart) {
      this.handlers.onDragStart(this.dragStartPosition);
    }
  }

  /**
   * 鼠标移动处理
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    const currentPosition = { x: event.clientX, y: event.clientY };
    const delta = {
      x: currentPosition.x - this.dragStartPosition.x,
      y: currentPosition.y - this.dragStartPosition.y
    };

    if (this.handlers.onDragMove) {
      this.handlers.onDragMove(delta);
    }
  }

  /**
   * 鼠标释放处理
   */
  private handleMouseUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
      if (this.handlers.onDragEnd) {
        this.handlers.onDragEnd();
      }
    }
  }

  /**
   * 触摸开始处理
   */
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    this.touches = Array.from(event.touches);

    if (this.touches.length === 1) {
      // 单指拖拽
      const touch = this.touches[0];
      this.isDragging = true;
      this.dragStartPosition = { x: touch.clientX, y: touch.clientY };
      
      if (this.handlers.onDragStart) {
        this.handlers.onDragStart(this.dragStartPosition);
      }
    } else if (this.touches.length === 2) {
      // 双指手势
      this.isDragging = false;
      const [touch1, touch2] = this.touches;
      
      this.lastDistance = this.calculateDistance(touch1, touch2);
      this.lastAngle = this.calculateAngle(touch1, touch2);
    }
  }

  /**
   * 触摸移动处理
   */
  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    this.touches = Array.from(event.touches);

    if (this.touches.length === 1 && this.isDragging) {
      // 单指拖拽
      const touch = this.touches[0];
      const currentPosition = { x: touch.clientX, y: touch.clientY };
      const delta = {
        x: currentPosition.x - this.dragStartPosition.x,
        y: currentPosition.y - this.dragStartPosition.y
      };

      if (this.handlers.onDragMove) {
        this.handlers.onDragMove(delta);
      }
    } else if (this.touches.length === 2) {
      // 双指手势
      const [touch1, touch2] = this.touches;
      
      const currentDistance = this.calculateDistance(touch1, touch2);
      const currentAngle = this.calculateAngle(touch1, touch2);

      // 缩放
      if (this.lastDistance !== null && this.handlers.onScaleChange) {
        const scaleRatio = currentDistance / this.lastDistance;
        this.handlers.onScaleChange(scaleRatio);
      }

      // 旋转
      if (this.lastAngle !== null && this.handlers.onRotationChange) {
        const angleDelta = currentAngle - this.lastAngle;
        this.handlers.onRotationChange(angleDelta);
      }

      this.lastDistance = currentDistance;
      this.lastAngle = currentAngle;
    }
  }

  /**
   * 触摸结束处理
   */
  private handleTouchEnd(): void {
    if (this.isDragging) {
      this.isDragging = false;
      if (this.handlers.onDragEnd) {
        this.handlers.onDragEnd();
      }
    }
    
    this.touches = [];
    this.lastDistance = null;
    this.lastAngle = null;
  }

  /**
   * 计算两点间距离
   */
  private calculateDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 计算两点间角度
   */
  private calculateAngle(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.atan2(dy, dx);
  }

  /**
   * 销毁控制器
   */
  dispose(): void {
    this.element.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
  }
}

export { EraserTool, GestureController };
export type { EraserSettings, TouchGesture, InteractionHandlers };