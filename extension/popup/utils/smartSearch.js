const semanticMap = {

  database: [
    "sql",
    "postgres",
    "mysql",
    "schema",
    "migration",
    "activerecord",
  ],

  rails: [
    "ruby",
    "controller",
    "model",
    "route",
    "activeadmin",
    "erb",
    "api",
  ],

  api: [
    "json",
    "endpoint",
    "fetch",
    "axios",
    "request",
  ],

  javascript: [
    "js",
    "node",
    "frontend",
    "react",
    "function",
  ],

  auth: [
    "jwt",
    "token",
    "login",
    "signup",
    "session",
  ],
};

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

      /* HOT */
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

      /* SEMANTIC SEARCH */
      const semanticWords =
        semanticMap[word] || [];

      const semanticMatch =
        semanticWords.some((term) =>
          content.includes(term)
        );

      /* NORMAL MATCH */
      const normalMatch =
        content.includes(word) ||
        title.includes(word);

      if (
        !normalMatch &&
        !semanticMatch
      ) {
        matched = false;
      }

    });

    return matched;

  });
}