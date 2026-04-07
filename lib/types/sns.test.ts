import { describe, it, expect } from 'vitest'
import type { SnsSeries, SnsPost, SnsSeriesStatus, SnsPostType } from './sns'

describe('sns types', () => {
  it('SnsSeriesStatus includes all valid values', () => {
    const statuses: SnsSeriesStatus[] = ['draft', 'queued']
    expect(statuses).toHaveLength(2)
  })

  it('SnsPostType includes all valid values', () => {
    const types: SnsPostType[] = ['normal', 'comment_hook', 'thread', 'affiliate']
    expect(types).toHaveLength(4)
  })

  it('SnsSeries has required fields', () => {
    const series: SnsSeries = {
      id: 'test-id',
      theme: 'AI活用術',
      pattern: '体験談型',
      quality_score: 8.5,
      score_breakdown: { hook: 8 },
      status: 'draft',
      queue_order: null,
      is_posted: false,
      posted_at: null,
      source: 'content-pipeline',
      source_draft_id: 'draft_001',
      created_at: '2026-04-07T00:00:00Z',
      updated_at: '2026-04-07T00:00:00Z',
    }
    expect(series.id).toBe('test-id')
    expect(series.is_posted).toBe(false)
  })

  it('SnsPost has required fields', () => {
    const post: SnsPost = {
      id: 'post-id',
      series_id: 'series-id',
      position: 0,
      text: '親投稿のテキスト',
      type: 'normal',
      threads_post_id: null,
      created_at: '2026-04-07T00:00:00Z',
      updated_at: '2026-04-07T00:00:00Z',
    }
    expect(post.position).toBe(0)
    expect(post.text).toBe('親投稿のテキスト')
  })
})
