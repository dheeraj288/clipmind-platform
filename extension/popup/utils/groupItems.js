export function groupItems(items) {

  const groups = {
    favorites: [],
    frequent: [],
    code: [],
    links: [],
    recent: [],
    others: [],
  };

  const now = Date.now();

  items.forEach((item) => {

    const createdAt =
      new Date(item.created_at).getTime();

    const hoursAgo =
      (now - createdAt) /
      (1000 * 60 * 60);

    /* FAVORITES */
    if (item.is_favorite) {

      groups.favorites.push(item);

      return;
    }

    /* FREQUENTLY USED */
    if ((item.copy_count || 0) >= 5) {

      groups.frequent.push(item);

      return;
    }

    /* CODE */
    if (item.clip_type === "code") {

      groups.code.push(item);

      return;
    }

    /* LINKS */
    if (item.clip_type === "link") {

      groups.links.push(item);

      return;
    }

    /* RECENT */
    if (hoursAgo <= 24) {

      groups.recent.push(item);

      return;
    }

    /* OTHERS */
    groups.others.push(item);

  });

  return {
    "⭐ Favorites":
      groups.favorites,

    "🔥 Frequently Used":
      groups.frequent,

    "💻 Code Snippets":
      groups.code,

    "🌐 Links":
      groups.links,

    "🕒 Recently Added":
      groups.recent,

    "📦 Others":
      groups.others,
  };
}