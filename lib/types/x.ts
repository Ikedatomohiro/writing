export type XSeriesStatus = 'draft' | 'queued' | 'posting' | 'posted' | 'rejected'
export type XCategory = 'note_article' | 'tech_tips' | 'career' | 'opinion'

export const X_CHAR_LIMIT = 280

export const X_CATEGORIES: readonly XCategory[] = [
  'note_article',
  'tech_tips',
  'career',
  'opinion',
] as const

export interface XSeries {
  id: string
  account: string
  theme: string | null
  category: XCategory | null
  quality_score: number | null
  score_breakdown: Record<string, number> | null
  status: XSeriesStatus
  queue_order: number | null
  is_posted: boolean
  posted_at: string | null
  source: string | null
  source_draft_id: string | null
  note_url: string | null
  hashtags: string[] | null
  created_at: string
  updated_at: string
}

export interface XPost {
  id: string
  series_id: string
  position: number
  text: string
  x_post_id: string | null
  source_url: string | null
  created_at: string
  updated_at: string
}

export interface XSeriesWithPosts extends XSeries {
  posts: XPost[]
}

// APIリクエスト用型
export interface CreateXSeriesRequest {
  account: string
  theme?: string
  category?: XCategory
  quality_score?: number
  score_breakdown?: Record<string, number>
  source?: string
  source_draft_id?: string
  note_url?: string
  hashtags?: string[]
  posts: Array<{
    position: number
    text: string
    source_url?: string
  }>
}

export interface UpdateXSeriesRequest {
  theme?: string
  category?: XCategory
  status?: XSeriesStatus
  queue_order?: number
}

export interface UpdateXPostRequest {
  text?: string
  source_url?: string
}

export interface ReorderXQueueRequest {
  series_ids: string[] // queue_order順に並べたseries IDの配列
}
