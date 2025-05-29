export const formatDate = (timestamp: any) => {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return "";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 1) {
    return "Gestern";
  } else if (diffDays < 7) {
    return date
      .toLocaleDateString("de-DE", { weekday: "short" })
      .replace(".", "");
  } else {
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
    });
  }
};