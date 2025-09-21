import { ApiUtils } from '../utils/apiUtils';
import { LocalizedText } from '../utils/textUtils';
import { PageResponseResult } from '../types/models';

export interface Post {
  post_id: string;
  title: LocalizedText;
  slug: string;
  author: string;
  publishedAt: string;
  status: 'draft' | 'published' | 'archived';
  featuredImageUrl: string;
  excerpt: LocalizedText;
  content: LocalizedText;
  meta_title: LocalizedText;
  meta_description: LocalizedText;
  createdAt: string;
  updatedAt: string;
}

export interface PostsSearchParams {
  postId?: string;
  slug?: string;
  status?: 'draft' | 'published' | 'archived';
  author?: string;
  search?: string;
  sortBy?: 'publishedAt' | 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  currentPage?: number;
  pageSize?: number;
  lang?: string;
}

export type PostsResponseResult = PageResponseResult<Post>;

export interface PostsSearchResult {
  posts: Post[];
  currentPage: number;
  pageSize: number;
  total: number;
}

export class PostsService {
  /**
   * 获取博客文章列表
   */
  static async getPosts(params: PostsSearchParams = {}): Promise<PostsSearchResult> {
    const {
      postId,
      slug,
      status,
      author,
      search,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
      currentPage = 1,
      pageSize = 10,
      lang = 'zh'
    } = params;

    try {
      // 构建查询参数
      const searchParams = new URLSearchParams();
      
      if (postId) searchParams.append('postId', postId);
      if (slug) searchParams.append('slug', slug);
      if (status) searchParams.append('status', status);
      if (author) searchParams.append('author', author);
      if (search) searchParams.append('search', search);
      if (sortBy) searchParams.append('sortBy', sortBy);
      if (sortOrder) searchParams.append('sortOrder', sortOrder);
      if (lang) searchParams.append('lang', lang);
      
      searchParams.append('currentPage', currentPage.toString());
      searchParams.append('pageSize', pageSize.toString());

      const response = await ApiUtils.get<PostsResponseResult>(`/api/posts?${searchParams.toString()}`);
      
      return {
        posts: response.data || [],
        total: response.pagination?.total || 0,
        currentPage: response.pagination?.currentPage || currentPage,
        pageSize: response.pagination?.pageSize || pageSize
      };
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      return {
        posts: [],
        total: 0,
        currentPage: 1,
        pageSize: 10
      };
    }
  }

  /**
   * 根据ID获取单篇文章
   */
  static async getPostById(postId: string): Promise<Post | null> {
    try {
      const result = await this.getPosts({ postId });
      return result.posts.length > 0 ? result.posts[0] : null;
    } catch (error) {
      console.error(`Failed to fetch post ${postId}:`, error);
      return null;
    }
  }

  /**
   * 根据slug获取单篇文章
   */
  static async getPostBySlug(slug: string): Promise<Post | null> {
    try {
      const result = await this.getPosts({ slug });
      return result.posts.length > 0 ? result.posts[0] : null;
    } catch (error) {
      console.error(`Failed to fetch post by slug ${slug}:`, error);
      return null;
    }
  }

  /**
   * 获取已发布的文章
   */
  static async getPublishedPosts(params: Omit<PostsSearchParams, 'status'> = {}): Promise<PostsSearchResult> {
    return this.getPosts({ ...params, status: 'published' });
  }
}

export const postsService = new PostsService();