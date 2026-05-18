export function getMemoryScore(item) {

  let score = 0;

  /* FAVORITES */
  if (item.is_favorite) {
    score += 100;
  }

  /* COPY COUNT */
  score +=
    (item.copy_count || 0) * 10;

  /* CODE SNIPPETS */
  if (
    item.clip_type === "code"
  ) {
    score += 20;
  }

  /* LINKS */
  if (
    item.clip_type === "link"
  ) {
    score += 5;
  }

  /* RECENTLY COPIED */
  if (item.last_copied_at) {

    const lastCopied =
      new Date(
        item.last_copied_at
      ).getTime();

    const hoursAgo =
      (Date.now() - lastCopied) /
      (1000 * 60 * 60);

    if (hoursAgo <= 24) {

      score += 50;

    } else if (hoursAgo <= 72) {

      score += 25;
    }
  }

  return score;
}

export function getRecommendations(
  items
) {

  return [...items]

    .sort(
      (a, b) =>
        getMemoryScore(b) -
        getMemoryScore(a)
    )

    .slice(0, 5);
}