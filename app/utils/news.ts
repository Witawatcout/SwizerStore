// "#Health,#WELLNESS" -> ["Health", "WELLNESS"]
export function newsTags(tag?: string | null) {
  return String(tag || '').split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean)
}

export function newsTagLabel(tag?: string | null) {
  return newsTags(tag).map(t => `#${t}`).join(' ')
}

export function newsDate(news?: { date?: string | null; created_at?: string | null } | null) {
  if (news?.date) return news.date
  if (!news?.created_at) return ''
  return new Date(news.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ponytail: rough estimate (~600 chars/min for Thai), no word segmentation
export function newsReadMinutes(content?: string | null) {
  const text = String(content || '').replace(/<[^>]*>/g, '')
  return Math.max(1, Math.ceil(text.length / 600))
}
