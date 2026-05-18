export function getSmartScore(item) {

  let score = 0;

  /* FAVORITES */
  if (item.is_favorite) {
    score += 100;
  }

  /* COPY COUNT */
  score +=
    (item.copy_count || 0) * 8;

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
    }
    else if (hoursAgo <= 72) {
      score += 25;
    }
  }

  /* RECENTLY CREATED */
  if (item.created_at) {

    const created =
      new Date(
        item.created_at
      ).getTime();

    const hoursAgo =
      (Date.now() - created) /
      (1000 * 60 * 60);

    if (hoursAgo <= 24) {
      score += 30;
    }
  }

  /* CODE PRIORITY */
  if (
    item.clip_type === "code"
  ) {
    score += 15;
  }

  /* LINKS */
  if (
    item.clip_type === "link"
  ) {
    score += 5;
  }

  return score;
}

export function sortData(items) {

  return [...items].sort(
    (a, b) =>
      getSmartScore(b) -
      getSmartScore(a)
  );
}