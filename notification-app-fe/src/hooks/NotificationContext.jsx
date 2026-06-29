import { createContext, useContext, useState, useEffect } from "react";
import { fetchNotifications } from "../api/notifications";
import { logger } from "../api/logger";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [type, setType] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Read viewed IDs from localStorage
  const [viewedIds, setViewedIds] = useState(() => {
    try {
      const saved = localStorage.getItem("viewed_notification_ids");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // Track all unread count across all fetched notifications, or from a general pool
  const loadNotifications = async (p = page, l = limit, t = type) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications(p, l, t);
      setNotifications(data.notifications ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
      logger.error("CONTEXT_ERROR", "Failed loading notifications in context", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(page, limit, type);
  }, [page, limit, type]);

  const markAsViewed = (id) => {
    setViewedIds((prev) => {
      const next = new Set(prev);
      if (!next.has(id)) {
        next.add(id);
        localStorage.setItem("viewed_notification_ids", JSON.stringify(Array.from(next)));
        logger.info("USER_ACTION", `Marked notification ${id} as viewed`);
      }
      return next;
    });
  };

  const markAllAsViewed = () => {
    setViewedIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      notifications.forEach((n) => {
        if (!next.has(n.ID)) {
          next.add(n.ID);
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem("viewed_notification_ids", JSON.stringify(Array.from(next)));
        logger.info("USER_ACTION", "Marked all current notifications as viewed");
      }
      return next;
    });
  };

  // We can calculate the count of unread notifications from the database/list
  // If we fetch all notifications or just use the current page's unread count
  // Let's also fetch a global unread count or estimate it
  const unreadCount = notifications.filter(n => !viewedIds.has(n.ID)).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        total,
        loading,
        error,
        page,
        setPage,
        limit,
        setLimit,
        type,
        setType,
        viewedIds,
        markAsViewed,
        markAllAsViewed,
        unreadCount,
        refresh: () => loadNotifications(page, limit, type),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  return useContext(NotificationContext);
}
