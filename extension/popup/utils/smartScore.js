export const getSmartScore = (item) => {
  let score = 0;

  if (item.is_favorite) score += 1000;

  score += (item.copy_count || 0) * 50;

  const hoursAgo =
    (Date.now() - new Date(item.created_at)) /
    (1000 * 60 * 60);

  if (item.last_copied_at) {
    const copiedAgo =
      (Date.now() - new Date(item.last_copied_at)) /
      (1000 * 60);

    if (copiedAgo < 2) score += 5000;
  }

  if (hoursAgo < 1) score += 500;
  else if (hoursAgo < 6) score += 300;
  else if (hoursAgo < 24) score += 100;
  else if (hoursAgo < 72) score += 50;

  if (item.clip_type === "code") score += 200;
  if (item.clip_type === "link") score += 150;

  return score;
};

export const sortData = (items) =>
  [...items].sort((a, b) => getSmartScore(b) - getSmartScore(a));