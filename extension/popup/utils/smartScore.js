const WEIGHTS = {
  favorite: 100,
  copy: 8,
  recentCopy24h: 50,
  recentCopy72h: 25,
  recentCreate24h: 30,
  code: 15,
  link: 5,
};

export function getSmartScore(item, debug = false) {
  let score = 0;

  const breakdown = {};

  /* FAVORITES */
  if (item.is_favorite) {
    score += WEIGHTS.favorite;
    breakdown.favorite = WEIGHTS.favorite;
  }

  /* COPY COUNT */
  const copyScore = (item.copy_count || 0) * WEIGHTS.copy;
  score += copyScore;
  breakdown.copy = copyScore;

  /* RECENT COPIED */
  if (item.last_copied_at) {
    const lastCopied = new Date(item.last_copied_at).getTime();
    const hoursAgo = (Date.now() - lastCopied) / (1000 * 60 * 60);

    if (hoursAgo <= 24) {
      score += WEIGHTS.recentCopy24h;
      breakdown.recentCopy = WEIGHTS.recentCopy24h;
    } else if (hoursAgo <= 72) {
      score += WEIGHTS.recentCopy72h;
      breakdown.recentCopy = WEIGHTS.recentCopy72h;
    }
  }

  /* RECENTLY CREATED */
  if (item.created_at) {
    const created = new Date(item.created_at).getTime();
    const hoursAgo = (Date.now() - created) / (1000 * 60 * 60);

    if (hoursAgo <= 24) {
      score += WEIGHTS.recentCreate24h;
      breakdown.recentCreate = WEIGHTS.recentCreate24h;
    }
  }

  /* TYPE BOOST */
  if (item.clip_type === "code") {
    score += WEIGHTS.code;
    breakdown.type = WEIGHTS.code;
  }

  if (item.clip_type === "link") {
    score += WEIGHTS.link;
    breakdown.type = WEIGHTS.link;
  }

  return debug
    ? { score, breakdown }
    : score;
}

export function sortData(items, debug = false) {
  const enriched = items.map(item => ({
    ...item,
    _smart: getSmartScore(item, debug),
  }));

  return enriched.sort((a, b) => {
    const scoreA = debug ? a._smart.score : a._smart;
    const scoreB = debug ? b._smart.score : b._smart;
    return scoreB - scoreA;
  });
}