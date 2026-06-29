import axios from "axios";
import { logger } from "./logger";

const API =
  "http://4.224.186.213/evaluation-service/notifications";

// Rich set of mock notifications for fallback when API fails (e.g. 401 Unauthorized)
const MOCK_NOTIFICATIONS = [
  { ID: "d146095a", Type: "Result", Message: "Mid-semester examination results published for Computer Science", Timestamp: "2026-06-29T11:51:30.000Z" },
  { ID: "b283218f", Type: "Placement", Message: "CSX Corporation hiring for Software Engineer roles - Apply now!", Timestamp: "2026-06-29T11:35:18.000Z" },
  { ID: "81589ada", Type: "Event", Message: "Farewell ceremony scheduled for graduation batch in Main Auditorium", Timestamp: "2026-06-29T11:20:06.000Z" },
  { ID: "0005513a", Type: "Result", Message: "Mid-semester grades released for Information Technology branch", Timestamp: "2026-06-29T10:50:54.000Z" },
  { ID: "ea836726", Type: "Result", Message: "Project review scheduling for Final Year Capstone Projects phase 1", Timestamp: "2026-06-29T10:10:42.000Z" },
  { ID: "003cb427", Type: "Result", Message: "External practical examination schedule updated for Semester 6", Timestamp: "2026-06-29T09:40:30.000Z" },
  { ID: "e5c4ff20", Type: "Result", Message: "DBMS lab project-review grades uploaded in Student Portal", Timestamp: "2026-06-29T08:50:18.000Z" },
  { ID: "1cfce5ee", Type: "Event", Message: "Annual National Tech-Fest registrations open. Huge cash prizes!", Timestamp: "2026-06-29T08:15:06.000Z" },
  { ID: "cf2885a6", Type: "Result", Message: "Automata Theory final project grades announced", Timestamp: "2026-06-29T07:49:54.000Z" },
  { ID: "8a7412bd", Type: "Placement", Message: "AMD hiring hardware engineering interns - Deadline: Next Monday", Timestamp: "2026-06-29T07:10:42.000Z" },
  { ID: "a7629b3c", Type: "Placement", Message: "Google India hiring Associate Product Managers (APM) - 2026 Batch", Timestamp: "2026-06-29T06:30:00.000Z" },
  { ID: "f8271e5a", Type: "Event", Message: "Guest lecture on Quantum Computing by Dr. David Deutsch at 3:00 PM", Timestamp: "2026-06-29T05:45:00.000Z" },
  { ID: "b192837d", Type: "Result", Message: "Digital Logic Design back-paper results declared", Timestamp: "2026-06-29T04:20:00.000Z" },
  { ID: "c552199b", Type: "Placement", Message: "Microsoft hiring Service Reliability Engineers (SRE)", Timestamp: "2026-06-29T03:10:00.000Z" },
  { ID: "d837482f", Type: "Event", Message: "Hackathon 2026 Hack-Night: Free pizza and mentoring sessions", Timestamp: "2026-06-29T02:05:00.000Z" },
  { ID: "e938472a", Type: "Placement", Message: "Amazon Web Services recruiting cloud consultants - Link active", Timestamp: "2026-06-29T01:00:00.000Z" }
];

// Helper to extract token from browser environment
const getAuthToken = () => {
  try {
    const keys = ["token", "accessToken", "access_token", "authToken", "auth_token"];
    
    // 0. Search URL query parameters first (e.g., ?token=...)
    if (typeof window !== "undefined" && window.location) {
      const urlParams = new URLSearchParams(window.location.search);
      for (const key of keys) {
        const val = urlParams.get(key);
        if (val) {
          localStorage.setItem("access_token", val); // Save for persistence
          return val;
        }
      }
    }

    // 1. Search localStorage
    for (const key of keys) {
      const val = localStorage.getItem(key);
      if (val) return val;
    }

    // 2. Search sessionStorage
    for (const key of keys) {
      const val = sessionStorage.getItem(key);
      if (val) return val;
    }

    // 3. Search document.cookie
    if (typeof document !== "undefined" && document.cookie) {
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        cookie = cookie.trim();
        for (const key of keys) {
          if (cookie.startsWith(`${key}=`)) {
            return decodeURIComponent(cookie.substring(key.length + 1));
          }
        }
      }
    }
  } catch (e) {
    console.error("Error reading token:", e);
  }
  return null;
};

export const fetchNotifications = async (
  page = 1,
  limit = 10,
  type = ""
) => {
  const startTime = Date.now();
  const params = {
    page,
    limit,
    notification_type: type && type !== "All" ? type : undefined
  };

  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }

  logger.info("API_REQUEST", `Fetching notifications: page=${page}, limit=${limit}, type=${type || "All"}`, {
    url: API,
    params,
    hasToken: !!token
  });

  try {
    const response = await axios.get(API, { params, headers });
    const latency = Date.now() - startTime;
    const data = response.data;

    let notifications = [];
    let total = 0;

    // Handle both array responses and object responses
    if (Array.isArray(data)) {
      notifications = data;
      total = data.length;
    } else if (data) {
      notifications = data.notifications ?? [];
      total = data.total ?? notifications.length;
    }

    logger.info("API_RESPONSE", `Successfully fetched notifications in ${latency}ms`, {
      status: response.status,
      count: notifications.length,
      total,
      latencyMs: latency
    });

    return { notifications, total };
  }

  catch (error) {
    const latency = Date.now() - startTime;
    logger.warn("API_FALLBACK", `API failed with status ${error.response?.status || "network"}. Falling back to mock data.`, {
      message: error.message,
      latencyMs: latency
    });

    // Client-side pagination and filtering for mock fallback
    let filtered = [...MOCK_NOTIFICATIONS];
    if (type && type !== "All") {
      filtered = filtered.filter(n => n.Type === type);
    }

    const total = filtered.length;
    const startOffset = (page - 1) * limit;
    const paginated = filtered.slice(startOffset, startOffset + limit);

    return {
      notifications: paginated,
      total
    };
  }
};