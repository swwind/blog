export function toChineseCalendar(date: number) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "full",
    calendar: "chinese",
  })
    .format(date)
    .slice(4, -3)
    .replace("十一月", "冬月");
}
