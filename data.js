console.log(
  new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "full",
    calendar: "chinese",
  })
    .format(new Date())
    .slice(4, -3)
);
