import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import BaseButton from '../components/ui/BaseButton';
import ImageGrid from '../components/iamges/ImageGrid';
import Breadcrumb, { BreadcrumbItem } from '../components/common/Breadcrumb';
import { ImageService, BaseImage, Tag } from '../services/imageService';
import { CategoriesService, Category } from '../services/categoriesService';
import { downloadImageByUrl } from '../utils/downloadUtils';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/textUtils';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { useCategories } from '../contexts/CategoriesContext';
import { getImageIdByName, isImageName, updateImageMappings, getImageNameById, getEnglishTitleFromImage } from '../utils/imageUtils';
import { getCategoryIdByName, getCategoryNameById, isCategoryName, getEnglishNameFromCategory, updateCategoryMappings } from '../utils/categoryUtils';
import { navigateWithLanguage } from '../utils/navigationUtils';
import SEOHead from '../components/common/SEOHead';

const ImageDetailPage: React.FC = () => {
  const { t } = useAsyncTranslation('categories');
  const { imageId, categoryId } = useParams<{ imageId: string; categoryId?: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { categories: allCategories, loading: categoriesLoading } = useCategories();

  const [image, setImage] = useState<BaseImage | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedImages, setRelatedImages] = useState<BaseImage[]>([]);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isRelatedImagesLoading, setIsRelatedImagesLoading] = useState(true);

  const loadingRef = useRef<string>(''); // 防止重复加载


  // 解析 additionalInfo，直接从多语言对象中获取本地化文本
  const parseAdditionalInfo = (additionalInfo: any) => {
    try {
      let infoObj = additionalInfo;

      // 如果是字符串，尝试解析 JSON
      if (typeof additionalInfo === 'string' && additionalInfo.trim()) {
        infoObj = JSON.parse(additionalInfo);
      }

      // 如果不是对象，返回 null
      if (typeof infoObj !== 'object' || infoObj === null) {
        return null;
      }

      // 直接从多语言对象中获取本地化文本并返回
      return getLocalizedText(infoObj, language);
    } catch (error) {
      console.error('Failed to parse additionalInfo:', error, additionalInfo);
      return null;
    }
  };

  useEffect(() => {
    const loadImageData = async () => {
      if (!imageId) return;

      // 防止重复加载：如果已经为当前imageId和categoryId组合正在加载，则跳过
      const currentKey = `${imageId}-${categoryId || 'no-category'}`;
      if (loadingRef.current === currentKey) {
        console.log('Already loading for', currentKey, 'skipping...');
        return;
      }

      // 设置当前加载的key
      loadingRef.current = currentKey;

      try {
        setIsImageLoading(true);

        // 如果URL中有categoryId，使用优化的加载逻辑
        if (categoryId) {
          // 步骤1：使用categories context获取全量分类数据
          if (categoriesLoading || !allCategories || allCategories.length === 0) {
            return;
          }

          // 步骤2：根据URL中的分类名称找到分类ID
          let foundCategory: Category | null = null;

          // 先尝试映射表
          if (isCategoryName(categoryId)) {
            const actualCategoryId = getCategoryIdByName(categoryId);
            foundCategory = allCategories.find(cat => cat.id === actualCategoryId) || null;
          }

          // 如果映射表没找到，通过SEO名称搜索
          if (!foundCategory) {
            foundCategory = allCategories.find((cat: Category) => {
              const seoName = getEnglishNameFromCategory(cat.id);
              return seoName === categoryId;
            }) || null;

            if (foundCategory) {
              // 更新映射表
              updateCategoryMappings([foundCategory]);
            }
          }

          if (foundCategory) {
            setCategory(foundCategory);

            // 步骤3：根据分类ID从后台获取该分类的所有图片
            const categoryImagesResult = await CategoriesService.getImagesByCategoryId(foundCategory.id);

            // 更新图片映射表
            updateImageMappings(categoryImagesResult.images);

            // 步骤4：根据URL中的图片名称过滤出需要的图片
            let foundImage: BaseImage | null = null;

            // 先尝试映射表
            if (isImageName(imageId)) {
              const actualImageId = getImageIdByName(imageId);
              foundImage = categoryImagesResult.images.find((img: BaseImage) => img.id === actualImageId) || null;
            }

            // 如果映射表没找到，通过SEO名称搜索
            if (!foundImage) {
              foundImage = categoryImagesResult.images.find((img: BaseImage) => {
                const seoName = getEnglishTitleFromImage(img.title);
                return seoName === imageId;
              }) || null;

              if (foundImage) {
                // 更新映射表
                updateImageMappings([foundImage]);
              }
            }

            if (foundImage) {
              setImage(foundImage);
              setIsImageLoading(false);

              // 异步加载相关图片，不阻塞主内容显示
              setIsRelatedImagesLoading(true);
              try {
                const relatedImages = await ImageService.getRelatedImages(foundImage.categoryId, foundImage.id);
                setRelatedImages(relatedImages);

                // 更新相关图片的映射表
                updateImageMappings(relatedImages);
              } catch (error) {
                console.error('Failed to load related images:', error);
              } finally {
                setIsRelatedImagesLoading(false);
              }
            } else {
              console.error('❌ Image not found in category:', imageId);
              setIsImageLoading(false);
            }
          } else {
            console.error('❌ Category not found:', categoryId);
            setIsImageLoading(false);
          }
        } else {
          // 如果没有categoryId，使用原来的逻辑（向后兼容）
          console.log('🔍 Loading image without category context:', imageId);

          // 尝试使用映射表转换SEO友好名称
          let actualImageId: string;
          if (isImageName(imageId)) {
            actualImageId = getImageIdByName(imageId);
          } else {
            actualImageId = imageId;
          }

          // 通过API搜索图片
          let foundImage: BaseImage | null = await ImageService.getImageById(actualImageId);

          if (!foundImage && imageId !== actualImageId) {
            // 如果通过映射表转换的ID没找到图片，尝试通过SEO名称搜索
            console.log('Image not found by ID, trying to search by SEO name:', imageId);
            try {
              const searchResult = await ImageService.searchImages({ query: imageId, pageSize: 50 });

              foundImage = searchResult.images.find(img => {
                const seoName = getEnglishTitleFromImage(img.title);
                return seoName === imageId;
              }) || null;

              if (foundImage) {
                console.log('Found image by SEO name search:', foundImage.id);
                updateImageMappings([foundImage]);
              }
            } catch (searchError) {
              console.error('Failed to search image by SEO name:', searchError);
            }
          }

          if (foundImage) {
            setImage(foundImage);
            setIsImageLoading(false);

            // 异步加载相关图片
            setIsRelatedImagesLoading(true);
            try {
              const relatedImages = await ImageService.getRelatedImages(foundImage.categoryId, foundImage.id);
              setRelatedImages(relatedImages);
              updateImageMappings(relatedImages);
            } catch (error) {
              console.error('Failed to load related images:', error);
            } finally {
              setIsRelatedImagesLoading(false);
            }
          } else {
            setIsImageLoading(false);
          }
        }
      } catch (error) {
        console.error('Failed to load image data:', error);
        setIsImageLoading(false);
      } finally {
        // 重置加载状态，允许下次加载
        loadingRef.current = '';
      }
    };

    loadImageData();
  }, [imageId, categoryId, allCategories, categoriesLoading]);

  const handleDownload = async (format: 'png' | 'pdf') => {
    if (!image) return;

    try {
      // 生成文件名
      const titleText = getLocalizedText(image.title, language) || 'image';
      const fileName = `coloring-page-${titleText.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20)}-${image.id.slice(-8)}.${format}`;

      // 根据格式选择不同的下载方式
      await downloadImageByUrl(image.tattooUrl, fileName);
    } catch (error) {
      console.error(`Download ${format} failed:`, error);
    }
  };

  // 获取面包屑路径（即使图片还在加载也可以显示基础面包屑）
  const getBreadcrumbPathEarly = (): BreadcrumbItem[] => {
    // 只有当category被设置时，才显示分类面包屑
    if (category) {
      // 4层面包屑：Home > Coloring Pages Free > xxx category > 图片名字
      const categoryName = getLocalizedText(category.name, language);
      const categoryPath = getCategoryNameById(category.id);

      return [
        { label: t('breadcrumb.home'), path: '/' },
        { label: t('breadcrumb.categories'), path: '/categories' },
        { label: categoryName, path: `/categories/${categoryPath}` },
        { label: image ? getLocalizedText(image.title, language) || '' : '', current: true }
      ];
    } else {
      // 默认2层面包屑：Home > 图片名字
      return [
        { label: t('breadcrumb.home'), path: '/' },
        { label: t('breadcrumb.categories'), path: '/categories' }
      ];
    }
  };

  const breadcrumbPath = getBreadcrumbPathEarly();

  // 如果图片加载失败且没有找到图片
  if (!isImageLoading && !image) {
    return (
      <Layout>
        <div className="w-full bg-[#030414] pb-16 md:pb-[120px]">
          {/* Breadcrumb - 即使出错也显示 */}
          <Breadcrumb items={[
            { label: t('breadcrumb.home'), path: '/' },
            { label: t('imageDetail.notFound.breadcrumb'), current: true }
          ]} />

          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <div className="text-lg lg:text-xl text-[#161616] mb-4">{t('imageDetail.notFound.title')}</div>
                <Button onClick={() => navigate('/')} variant="gradient">
                  {t('imageDetail.notFound.goHome')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={image ? `${getLocalizedText(image.title, language)} - Free Coloring Page` : 'Coloring Page'}
        description={image ? `Download free printable ${getLocalizedText(image.title, language).toLowerCase()} coloring page. High-quality PDF and PNG formats available instantly.` : 'Download free printable coloring pages.'}
        keywords={image ? `${getLocalizedText(image.title, language).toLowerCase()} coloring page, free printable coloring page, ${getLocalizedText(image.title, language).toLowerCase()} coloring sheet` : 'coloring page, printable coloring page'}
        ogTitle={image ? `${getLocalizedText(image.title, language)} - Free Coloring Page` : 'Coloring Page'}
        ogDescription={image ? `Download free printable ${getLocalizedText(image.title, language).toLowerCase()} coloring page. High-quality PDF and PNG formats available instantly.` : 'Download free printable coloring pages.'}
        noIndex={true}
      />
      <div className="w-full bg-[#030414] relative">
        {/* Breadcrumb - 始终显示 */}
        <Breadcrumb items={breadcrumbPath} />

        {/* Main Content */}
        <div className="container mx-auto px-4 max-w-[1380px]">
          {isImageLoading ? (
            /* 加载状态 - 不显示任何文本 */
            <div className="flex justify-center items-center py-20 h-[1380px]">
              {/* 加载时不显示任何内容 */}
            </div>
          ) : image ? (
            /* 图片内容 */
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-12 lg:mb-20 max-w-[1170px] mx-auto">
              {/* Left Side - Image */}
              <div className="flex justify-center lg:justify-start lg:w-[400px]">
                <img 
                  src={image.tattooUrl}
                  alt={getLocalizedText(image.title, language)}
                  className="w-full max-w-[500px] h-auto object-contain rounded-lg"
                />
              </div>

              {/* Right Side - Details */}
              <div className="flex-1 lg:w-[670px] flex flex-col gap-4">
                {/* Prompt Section */}
                <div className="flex flex-col gap-4">
                  <div className="text-[#ECECEC] text-base font-bold capitalize">
                    Prompt
                  </div>
                  <div className="text-[#ECECEC] text-sm font-normal leading-5 break-words max-w-[740px]">
                    {getLocalizedText(image.prompt, language) || getLocalizedText(image.description, language)}
                  </div>
                </div>

                {/* Tags Section */}
                {image.tags && image.tags.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <div className="text-[#ECECEC] text-base font-bold">
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-2 max-w-[740px]">
                      {image.tags.map((tag: Tag) => (
                        <div 
                          key={tag.id}
                          className="px-3 py-2 rounded-2xl border border-[#4E5056] flex justify-center items-center"
                        >
                          <div className="text-[#ECECEC] text-sm font-normal leading-4">
                            {getLocalizedText(tag.name, language)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <BaseButton
                    variant="primary"
                    onClick={() => {
                      console.log('Recreate clicked');
                    }}
                  >
                    Recreate
                  </BaseButton>
                  <BaseButton
                    variant="secondary"
                    onClick={() => handleDownload('png')}
                  >
                    Download
                  </BaseButton>
                </div>
              </div>
            </div>
          ) : null}

          {/* Article Content */}
          {!isImageLoading && image && (() => {
            const additionalInfo = parseAdditionalInfo(image.additionalInfo);

            if (!additionalInfo || !additionalInfo.trim()) {
              return null;
            }

            return (
              <article className="mb-4 max-w-[1170px] mx-auto">
                <div 
                  className='prose prose-dark'
                  dangerouslySetInnerHTML={{ __html: additionalInfo }}
                />
              </article>
            );
          })()}

          {/* You Might Also Like - 独立显示相关图片加载状态 */}
          <div className='py-20'>
            <h2 className="text-center text-[#ECECEC] text-2xl lg:text-3xl xl:text-[46px] font-bold capitalize mb-8 lg:mb-12 leading-relaxed lg:leading-[1.6] px-4">
              {t('imageDetail.relatedImages')}
            </h2>

            {/* Related Images Grid */}
            <div>
              {isRelatedImagesLoading ? (
                <div className="flex justify-center items-center py-12">
                  {/* 加载时不显示任何内容 */}
                </div>
              ) : relatedImages.length > 0 ? (
                <ImageGrid
                  images={relatedImages}
                  isLoading={false}
                  onImageClick={(image) => {
                    // 导航到图片详情页，使用SEO友好的图片路径
                    const imagePath = getImageNameById(image.id);

                    // 如果当前在分类页面结构中，保持在同一分类内跳转
                    if (categoryId) {
                      navigateWithLanguage(navigate, `/categories/${categoryId}/${imagePath}`);
                    } else {
                      // 否则使用传统的图片详情页路径
                      navigateWithLanguage(navigate, `/image/${imagePath}`);
                    }
                  }}
                />
              ) : (
                <div className="flex justify-center items-center py-12">
                  <div className="text-sm text-[#6B7280]">{t('imageDetail.noRelatedImages')}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ImageDetailPage; 