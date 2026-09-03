export type CategoryId = 'all' | 'dev' | 'crypto' | 'text' | 'daily';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  iconName: string;
}

export interface ToolMeta {
  id: string; // URL slug, e.g., 'json-formatter'
  name: string;
  description: string;
  category: Exclude<CategoryId, 'all'>;
  iconName: string;
  keywords: string[];
  badge?: '热门' | '推荐' | '新上线';
}
