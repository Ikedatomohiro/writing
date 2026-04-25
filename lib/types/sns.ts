export type SnsSeriesStatus = 'draft' | 'queued'
export type SnsPostType = 'normal' | 'comment_hook' | 'thread' | 'affiliate'

export interface SnsSeries {
  id: string
  theme: string | null
  pattern: string | null
  quality_score: number | null
  score_breakdown: Record<string, number> | null
  status: SnsSeriesStatus
  queue_order: number | null
  is_posted: boolean
  posted_at: string | null
  source: string | null
  source_draft_id: string | null
  account: string
  created_at: string
  updated_at: string
}

export interface SnsPost {
  id: string
  series_id: string
  position: number
  text: string
  type: SnsPostType
  threads_post_id: string | null
  created_at: string
  updated_at: string
}

export interface SnsSeriesWithPosts extends SnsSeries {
  posts: SnsPost[]
}

// APIリクエスト用型
export interface CreateSeriesRequest {
  theme?: string
  pattern?: string
  quality_score?: number
  score_breakdown?: Record<string, number>
  source?: string
  source_draft_id?: string
  posts: Array<{
    position: number
    text: string
    type?: SnsPostType
  }>
}

export interface UpdateSeriesRequest {
  theme?: string
  pattern?: string
  status?: SnsSeriesStatus
  queue_order?: number
}

export interface UpdatePostRequest {
  text?: string
  type?: SnsPostType
}

export interface ReorderPostsRequest {
  post_ids: string[]  // position順に並べたpost IDの配列
}

export interface ReorderQueueRequest {
  series_ids: string[]  // queue_order順に並べたseries IDの配列
}
