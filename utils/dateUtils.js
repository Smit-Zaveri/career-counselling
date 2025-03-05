/**
 * Format a date into a relative time string (e.g., "5 minutes ago")
 * @param {Date|Object} dateOrTimestamp - Date object or Firebase timestamp
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (dateOrTimestamp) => {
  if (!dateOrTimestamp) return "";

  // Convert Firebase timestamp to Date if needed
  const date = dateOrTimestamp.toDate
    ? dateOrTimestamp.toDate()
    : new Date(dateOrTimestamp);

  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return "just now";
  } else if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  } else {
    // Format date for older dates
    const options = { month: "short", day: "numeric", year: "numeric" };
    return date.toLocaleDateString(undefined, options);
  }
};

/**
 * Format a date into a readable string (Today, Yesterday, or date)
 * @param {Date|Object} dateOrTimestamp - Date object or Firebase timestamp
 * @returns {string} Formatted date string
 */
export const formatReadableDate = (dateOrTimestamp) => {
  if (!dateOrTimestamp) return "";

  // Convert Firebase timestamp to Date if needed
  const date = dateOrTimestamp.toDate
    ? dateOrTimestamp.toDate()
    : new Date(dateOrTimestamp);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return `Today at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (isYesterday) {
    return `Yesterday at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};
