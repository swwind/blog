/** this is unstable!!! */
export function toChineseCalendar(date: number | Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "full",
    calendar: "chinese",
  })
    .format(date)
    .slice(4, -3)
    .replace("十一月", "冬月");
}

export function toYangliCalendar(date: number | Date) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "long" }).format(date);
}

export function formatDate(date: number | Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "long",
    // timeStyle: "medium",
  }).format(date);
}
