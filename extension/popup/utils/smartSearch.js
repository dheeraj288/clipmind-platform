export function smartSearch(
  items,
  query
) {

  if (!query?.trim()) {
    return items;
  }

  const q =
    query.toLowerCase().trim();

  const words =
    q.split(" ");

  return items.filter((item) => {

    const content =
      item.content?.toLowerCase() || "";

    const title =
      item.page_title?.toLowerCase() || "";

    const type =
      item.clip_type?.toLowerCase() || "";

    let matched = true;

    words.forEach((word) => {

      /* FAVORITES */
      if (
        word === "fav" ||
        word === "favorite"
      ) {

        if (!item.is_favorite) {
          matched = false;
        }

        return;
      }

      /* HOT / TRENDING */
      if (
        word === "hot" ||
        word === "trending"
      ) {

        if (
          (item.copy_count || 0) < 5
        ) {
          matched = false;
        }

        return;
      }

      /* CODE */
      if (word === "code") {

        if (type !== "code") {
          matched = false;
        }

        return;
      }

      /* LINKS */
      if (word === "link") {

        if (type !== "link") {
          matched = false;
        }

        return;
      }

      /* EMAIL */
      if (word === "email") {

        if (type !== "email") {
          matched = false;
        }

        return;
      }

      /* RECENT */
      if (
        word === "recent" ||
        word === "today"
      ) {

        const created =
          new Date(
            item.created_at
          ).getTime();

        const hoursAgo =
          (Date.now() - created) /
          (1000 * 60 * 60);

        if (hoursAgo > 24) {
          matched = false;
        }

        return;
      }

      /* NORMAL TEXT SEARCH */
      const textMatch =
        content.includes(word) ||
        title.includes(word);

      if (!textMatch) {
        matched = false;
      }

    });

    return matched;

  });
}