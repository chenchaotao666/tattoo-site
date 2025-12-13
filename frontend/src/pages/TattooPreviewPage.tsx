import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  TattooEngine,
  TattooSettings,
  isValidImageType,
  downloadImage,
  DEFAULT_SETTINGS,
} from '@/utils/tattoo';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import SimpleTattooCanvas from '@/components/tryon/SimpleTattooCanvas';
import TattooCanvas3D from '@/components/tryon/3DTattooCanvas';

// 接口定义

interface UploadedFile {
  url: string;
  file: File;
  width: number;
  height: number;
}


// 主要组件
const TattooPreviewPage: React.FC = () => {
  const { t } = useAsyncTranslation('tattooPreview');
  const [currentStep, setCurrentStep] = useState(1);
  const [baseImage, setBaseImage] = useState<UploadedFile | null>(null);
  const [tattooImage, setTattooImage] = useState<UploadedFile | null>(null);
  const [originalTattooSize, setOriginalTattooSize] = useState<{ width: number; height: number } | null>(null);
  const [engine, setEngine] = useState<TattooEngine | null>(null);
  const [removeBackground, setRemoveBackground] = useState(false); // 默认不去背景
  const [useSimpleMode, setUseSimpleMode] = useState(true); // 默认使用简化预览模式

  const baseImageInputRef = useRef<HTMLInputElement>(null);
  const tattooImageInputRef = useRef<HTMLInputElement>(null);

  // 简化模式的设置
  const [settingsSimple, setSettingsSimple] = useState<TattooSettings>({
    ...DEFAULT_SETTINGS,
    scale: 0.36,
    scaleX: 1.0,
    scaleY: 1.0,
    opacity: 1.0
  });

  // 3D模式的设置
  const [settings, setSettings] = useState<TattooSettings>({
    ...DEFAULT_SETTINGS,
    scale: 0.18,       // 增加默认scale值，让纹身变小
    scaleX: 1.0,      // 默认宽度缩放
    scaleY: 1.0,      // 默认高度缩放
    opacity: 1.0     // 默认opacity为100%
  });

  const handleImageUpload = async (file: File, type: 'base' | 'tattoo') => {
    if (!isValidImageType(file)) {
      alert('Invalid image file format (JPEG, PNG, WebP only)');
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      
      img.onload = () => {
        const uploadedFile: UploadedFile = {
          url,
          file,
          width: img.naturalWidth,
          height: img.naturalHeight,
        };
        
        if (type === 'base') {
          setBaseImage(uploadedFile);
        } else {
          setTattooImage(uploadedFile);
          // 保存原始纹身图片尺寸
          setOriginalTattooSize({ width: img.naturalWidth, height: img.naturalHeight });
        }
      };
      
      img.onerror = () => {
        alert('Image loading failed, please try again');
      };
      
      img.src = url;
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('Image upload failed, please try again');
    }
  };

  const updateSettings = useCallback((newSettings: Partial<TattooSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // 简化模式设置更新函数
  const updateSettingsSimple = useCallback((newSettings: Partial<TattooSettings>) => {
    setSettingsSimple(prev => ({ ...prev, ...newSettings }));
  }, []);

  const exportImage = () => {
    try {
      let dataURL: string;

      if (engine) {
        // 高级3D模式：使用引擎导出
        dataURL = engine.exportImage();
      } else {
        // 简化模式：直接从Canvas导出
        const canvas = document.querySelector('.canvas-container canvas') as HTMLCanvasElement;
        if (!canvas) {
          alert('Canvas not found, please try again');
          return;
        }
        dataURL = canvas.toDataURL('image/png');
      }

      downloadImage(dataURL, `tattoo-preview-${Date.now()}.png`);
    } catch (error) {
      console.error('导出失败:', error);
      alert('Export failed, please try again');
    }
  };

  const resetAllSettings = () => {
    const defaultSettings = {
      ...DEFAULT_SETTINGS,
      scale: 0.18,       // 与其他地方保持一致，让纹身变小
      scaleX: 1.0,     // 默认宽度缩放
      scaleY: 1.0,     // 默认高度缩放
      opacity: 1.0,    // 默认opacity为100%
      contrast: 1.0    // 默认contrast为1.0
    };

    // 重置两个模式的设置
    setSettings(defaultSettings);
    setSettingsSimple(defaultSettings);

    if (engine) {
      engine.updateSettings(defaultSettings);
    }
  };

  const handleEngineReady = useCallback((tattooEngine: TattooEngine) => {
    setEngine(tattooEngine);
    // 将页面的默认设置同步到引擎，而不是相反
    tattooEngine.updateSettings(settings);
  }, [settings]);

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return tattooImage !== null;
      case 2:
        return baseImage !== null;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <style>{`
        /* 修复当前页面按钮颜色 */
        .tattoo-page .bg-primary { background-color: #3b82f6; }
        .tattoo-page .text-primary-foreground { color: #ffffff; }
        .tattoo-page .hover\\:bg-primary\\/90:hover { background-color: rgba(59, 130, 246, 0.9); }
        .tattoo-page .border-input { border-color: #e2e8f0; }
        .tattoo-page .bg-background { background-color: #ffffff; }
        .tattoo-page .text-accent-foreground { color: #1e293b; }
        .tattoo-page .hover\\:bg-accent:hover { background-color: #f1f5f9; }
        .tattoo-page .hover\\:text-accent-foreground:hover { color: #1e293b; }
        .tattoo-page .bg-destructive { background-color: #ef4444; }
        .tattoo-page .text-destructive-foreground { color: #ffffff; }
        .tattoo-page .hover\\:bg-destructive\\/90:hover { background-color: rgba(239, 68, 68, 0.9); }
        .tattoo-page .bg-secondary { background-color: #f1f5f9; }
        .tattoo-page .text-secondary-foreground { color: #1e293b; }
        .tattoo-page .hover\\:bg-secondary\\/80:hover { background-color: rgba(241, 245, 249, 0.8); }

        /* Step indicator styles */
        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin: 2rem 0;
        }

        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
          margin: 0 3rem;
        }

        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-bottom: 8px;
          background-color: #e5e7eb;
          color: #6b7280;
          transition: all 0.3s ease;
        }

        .step-item.active .step-circle {
          background-color: #3b82f6;
          color: white;
        }

        .step-item.completed .step-circle {
          background-color: #10b981;
          color: white;
        }

        .step-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          text-align: center;
          white-space: nowrap;
        }

        .step-item.active .step-label {
          color: #3b82f6;
        }

        .step-item.completed .step-label {
          color: #10b981;
        }

        .step-connector {
          position: absolute;
          top: 20px;
          left: 20%;
          right: 20%;
          height: 2px;
          background-color: #e5e7eb;
          z-index: 1;
        }

        /* Upload placeholder styles */
        .upload-placeholder {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          background-color: #f9fafb;
        }

        .upload-placeholder:hover {
          border-color: #3b82f6;
          background-color: #f0f9ff;
        }

        .upload-img {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          opacity: 0.6;
        }
      `}</style>
      <div className="tattoo-page">
        {/* 页面标题和描述 */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Virtual Try On Tattoo</h1>
              <p className="text-lg text-gray-600">
                Experience how your tattoo will appear on your skin with our cutting-edge AI technology.
                Simply upload your photos and receive a lifelike preview in seconds.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step-item ${
              currentStep === 1 ? 'active' :
              currentStep > 1 ? 'completed' : ''
            }`}>
              <div className="step-circle">1</div>
              <div className="step-label">Upload Tattoo Design</div>
            </div>

            <div className={`step-item ${
              currentStep === 2 ? 'active' :
              currentStep > 2 ? 'completed' : ''
            }`}>
              <div className="step-circle">2</div>
              <div className="step-label">Upload Body Photo</div>
            </div>

            <div className={`step-item ${
              currentStep === 3 ? 'active' : ''
            }`}>
              <div className="step-circle">3</div>
              <div className="step-label">Finish</div>
            </div>

            <div className="step-connector"></div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Step 1: Upload Tattoo Design</h2>
                <p className="text-gray-600 mb-6">Upload your tattoo design or choose one from your library.</p>

                <div className="upload-placeholder" onClick={() => tattooImageInputRef.current?.click()}>
                  {tattooImage ? (
                    <div>
                      <img
                        src={tattooImage.url}
                        alt="Uploaded tattoo"
                        className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                      />
                      <p className="text-green-600 font-medium">✓ Tattoo design uploaded successfully</p>
                      <p className="text-sm text-gray-500 mt-2">Click to change image</p>
                    </div>
                  ) : (
                    <div>
                      <img
                        src="https://remaker.ai/userspace/saasbox/image/face/upload.png"
                        alt="upload"
                        className="upload-img"
                      />
                      <p className="text-lg text-gray-700 mb-2">Click or drag image to this area to upload</p>
                      <p className="text-sm text-gray-500">Supports JPG, PNG formats</p>
                    </div>
                  )}
                </div>

                <input
                  ref={tattooImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'tattoo');
                  }}
                />

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={nextStep}
                    disabled={!canProceedToNextStep()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Step 2: Upload Body Photo</h2>
                <p className="text-gray-600 mb-6">Upload a clear photo of the area where you want the tattoo.</p>

                <div className="upload-placeholder" onClick={() => baseImageInputRef.current?.click()}>
                  {baseImage ? (
                    <div>
                      <img
                        src={baseImage.url}
                        alt="Uploaded body"
                        className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                      />
                      <p className="text-green-600 font-medium">✓ Body photo uploaded successfully</p>
                      <p className="text-sm text-gray-500 mt-2">Click to change image</p>
                    </div>
                  ) : (
                    <div>
                      <img
                        src="https://remaker.ai/userspace/saasbox/image/face/upload.png"
                        alt="upload"
                        className="upload-img"
                      />
                      <p className="text-lg text-gray-700 mb-2">Click or drag image to this area to upload</p>
                      <p className="text-sm text-gray-500">Supports JPG, PNG formats</p>
                    </div>
                  )}
                </div>

                <input
                  ref={baseImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'base');
                  }}
                />

                <div className="flex justify-between mt-6">
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="px-8 py-2"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={!canProceedToNextStep()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Step 3: Preview & Adjust</h2>
                <p className="text-gray-600 mb-6">Adjust your tattoo position, size, and effects to get the perfect preview.</p>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                  {/* 控制面板 */}
                  <Card className="xl:col-span-1">
                    <CardHeader>
                      <CardTitle>Adjustment Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                      {/* 工具栏按钮 */}
                      <div className="space-y-2">
                        <Button
                          onClick={resetAllSettings}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          🔄 Reset
                        </Button>
                        <Button
                          onClick={exportImage}
                          variant="default"
                          size="sm"
                          disabled={!baseImage}
                          className="w-full"
                        >
                          📥 Export
                        </Button>
                      </div>

                      {/* 纹身调节 */}
                      {tattooImage && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Opacity: {Math.round((useSimpleMode ? settingsSimple : settings).opacity * 100)}%
                            </label>
                            <Slider
                              value={[(useSimpleMode ? settingsSimple : settings).opacity]}
                              onValueChange={(value) => (useSimpleMode ? updateSettingsSimple : updateSettings)({ opacity: value[0] })}
                              min={0.1}
                              max={1}
                              step={0.1}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Contrast: {(useSimpleMode ? settingsSimple : settings).contrast.toFixed(1)}
                            </label>
                            <Slider
                              value={[(useSimpleMode ? settingsSimple : settings).contrast]}
                              onValueChange={(value) => (useSimpleMode ? updateSettingsSimple : updateSettings)({ contrast: value[0] })}
                              min={0.5}
                              max={2}
                              step={0.1}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Black & White</label>
                            <Switch
                              checked={(useSimpleMode ? settingsSimple : settings).blackAndWhite}
                              onCheckedChange={(checked) => (useSimpleMode ? updateSettingsSimple : updateSettings)({ blackAndWhite: checked })}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Remove Background</label>
                            <Switch
                              checked={removeBackground}
                              onCheckedChange={setRemoveBackground}
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* 预览区域 */}
                  <div className="xl:col-span-3 relative">
                    <Card className="rounded-2xl overflow-hidden">
                      <CardContent className="p-2">
                        <div className="w-full flex justify-center">
                          {baseImage || tattooImage ? (
                            <>
                              {useSimpleMode ? (
                                <div>
                                  <div className="mb-4 flex items-center gap-4">
                                    <Button
                                      onClick={() => setUseSimpleMode(false)}
                                      variant="outline"
                                      size="sm"
                                    >
                                      🚀 启用高级3D模式
                                    </Button>
                                    <span className="text-sm text-gray-600">当前使用简化预览模式，包含皮肤检测功能</span>
                                  </div>
                                  <SimpleTattooCanvas
                                    baseImage={baseImage?.url || null}
                                    tattooImage={tattooImage?.url || null}
                                    settings={settingsSimple}
                                    onSettingsChange={updateSettingsSimple}
                                    originalTattooSize={originalTattooSize}
                                    removeBackground={removeBackground}
                                    onRemoveBackgroundChange={setRemoveBackground}
                                  />
                                </div>
                              ) : (
                                <div>
                                  <div className="mb-4 flex items-center gap-4">
                                    <Button
                                      onClick={() => setUseSimpleMode(true)}
                                      variant="outline"
                                      size="sm"
                                    >
                                      ← 回到简化模式
                                    </Button>
                                    <span className="text-sm text-gray-600">高级3D模式</span>
                                  </div>
                                  <TattooCanvas3D
                                    baseImage={baseImage?.url || null}
                                    tattooImage={tattooImage?.url || null}
                                    settings={settings}
                                    onSettingsChange={updateSettings}
                                    onEngineReady={handleEngineReady}
                                    originalTattooSize={originalTattooSize}
                                    removeBackground={removeBackground}
                                    onRemoveBackgroundChange={setRemoveBackground}
                                  />
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-[50vh] min-h-[400px] border border-dashed border-gray-300 rounded-lg">
                              <div className="text-center">
                                <div className="text-6xl mb-4">🎨</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                  Preview Area
                                </h3>
                                <p className="text-gray-500">
                                  Your tattoo preview will appear here once both images are uploaded
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="px-8 py-2"
                  >
                    Previous
                  </Button>
                  <div className="text-center text-sm text-gray-600">
                    Drag the tattoo in the preview area to reposition it
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TattooPreviewPage;