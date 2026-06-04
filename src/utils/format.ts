export function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  const startText = `${start.getFullYear()}.${String(start.getMonth() + 1).padStart(2, '0')}.${String(start.getDate()).padStart(2, '0')}`
  const endText = `${String(end.getMonth() + 1).padStart(2, '0')}.${String(end.getDate()).padStart(2, '0')}`
  return startDate === endDate ? startText : `${startText} - ${endText}`
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value)
}

export function regionLabel(region: string) {
  const labels: Record<string, string> = {
    mainland: '中国大陆',
    hmt: '港澳台',
    overseas: '海外'
  }
  return labels[region] ?? region
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    upcoming: '即将开始',
    ongoing: '进行中',
    ended: '已结束',
    draft: '待确认',
    verified: '已核验',
    pending: '待核验',
    expired: '可能失效'
  }
  return labels[status] ?? status
}
