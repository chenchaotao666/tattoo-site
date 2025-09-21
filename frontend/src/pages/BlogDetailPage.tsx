import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEOHead from '../components/common/SEOHead';
import BackToTop from '../components/common/BackToTop';
import Breadcrumb from '../components/common/Breadcrumb';
import { useAsyncTranslation, useLanguage } from '../contexts/LanguageContext';
import { PostsService, Post } from '../services/postsService';
import { createLanguageAwarePath, navigateWithLanguage } from '../utils/navigationUtils';
import { getLocalizedText } from '../utils/textUtils';
import { useLoading } from '../contexts/LoadingContext';
import { UrlUtils } from '../utils/urlUtils';
import TryNow from '../components/common/TryNow';

const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useAsyncTranslation('common');
  const { t: navT } = useAsyncTranslation('navigation');
  const { language } = useLanguage();
  const { startLoading, finishLoading, isLoading } = useLoading();
  const [article, setArticle] = useState<Post | null>(location.state?.article || null);


  // Helper function to get content in current language using textUtils
  const getLocalizedContent = (content: any) => {
    return getLocalizedText(content, language as any);
  };

  const getLocalizedContentOptional = (content?: any) => {
    if (!content) return '';
    return getLocalizedText(content, language as any);
  };

  // Fetch post data by slug
  const fetchPost = async (slug: string) => {
    try {
      startLoading(); // 开始加载进度条

      const result = await PostsService.getPosts({
        slug: slug,
        status: 'published',
        lang: language
      });

      if (!result.posts || result.posts.length === 0) {
        finishLoading();
        return;
      }

      setArticle(result.posts[0]);
      finishLoading(); // 完成进度条
    } catch (err) {
      console.error('Failed to fetch post:', err);
      finishLoading();
    }
  };

  useEffect(() => {
    if (!slug) {
      navigate('/blog');
      return;
    }

    // 如果已有文章数据（从BlogPage传递过来的），则不需要重新请求
    if (!article) {
      fetchPost(slug);
    }
  }, [slug, navigate, language, article]);


  return (
    <Layout>
      {(isLoading || !article) ? null : (() => {
        const currentTitle = getLocalizedContent(article.title);
        const currentContent = getLocalizedContent(article.content);
        const currentExcerpt = getLocalizedContentOptional(article.excerpt);
        const currentMetaTitle = getLocalizedContentOptional(article.metaTitle);
        const currentMetaDescription = getLocalizedContentOptional(article.metaDesc);

        return (<>
          <SEOHead
            title={currentMetaTitle || currentTitle}
            description={currentMetaDescription || currentExcerpt || ''}
            keywords="tattoo ideas, AI tattoo designs, tattoo inspiration, tattoo styles, tattoo tips"
            ogTitle={currentMetaTitle || currentTitle}
            ogDescription={currentMetaDescription || currentExcerpt || ''}
            ogImage={article.featuredImageUrl}
            canonicalUrl={`${window.location.origin}/blog/${article.slug}`}
          />

          <div className="min-h-screen bg-[#030414]">
            <div className="mx-auto max-w-6xl pb-20">
              {/* Breadcrumb */}
              <Breadcrumb
                  items={[
                    { label: navT('breadcrumb.home'), path: '/' },
                    { label: navT('breadcrumb.blog'), path: '/blog' },
                    { label: currentTitle, current: true }
                  ]}
               />

              {/* Article Header */}
              <header className="mb-4">
                <h1 className="text-[42px] font-bold text-white mb-6 leading-tight">
                  {currentTitle}
                </h1>

                <div className="flex items-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {t('blog.by')} <span className="font-medium">{article.author}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {t('blog.publishedOn')} {new Date(article.publishedAt).toLocaleDateString(language, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Featured Image */}
                {article.featuredImageUrl && article.featuredImageUrl.trim() !== '' && (
                  <div className="my-4">
                    <img
                      src={UrlUtils.ensureAbsoluteUrl(article.featuredImageUrl)}
                      alt={currentTitle}
                      className="w-auto h-auto object-contain rounded-lg shadow-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </header>

              {/* Article Content */}
              <article className="mb-12">
                <div
                  className="prose prose-dark"
                  dangerouslySetInnerHTML={{ __html: currentContent }}
                />
              </article>


              {/* Back to Blog */}
              <div className="flex justify-center">
                <button
                  className="h-[60px] px-[50px] bg-white rounded-lg flex justify-center items-center gap-10 hover:bg-gray-300 transition-colors duration-200"
                  onClick={() => navigateWithLanguage(navigate, '/blog')}
                >
                  <div className="text-black text-xl font-bold">
                    {t('blog.backToBlog')}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-20">
            {/* TryNow component */}
            <TryNow
              title={t('tryNow.title')}
              description={t('tryNow.description')}
              buttonText={t('tryNow.tryNow')}
              buttonLink="/create"
            />
          </div>

          <BackToTop />
        </>);
      })()}
    </Layout>
  );
};

export default BlogDetailPage;