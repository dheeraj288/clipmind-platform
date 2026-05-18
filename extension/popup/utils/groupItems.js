export function groupItems(items) {
  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  items.forEach((item) => {
    const created = new Date(item.created_at);
    const diff = now - created;

    if (created.toDateString() === now.toDateString()) {
      groups.today.push(item);
    } else if (diff < oneDay * 2) {
      groups.yesterday.push(item);
    } else if (diff < oneDay * 7) {
      groups.thisWeek.push(item);
    } else {
      groups.older.push(item);
    }
  });

  return groups;
}