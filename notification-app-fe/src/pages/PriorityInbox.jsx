import { useEffect, useState } from "react";
import {
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Divider,
  Stack,
  Alert,
  CircularProgress
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import { fetchNotifications } from "../api/notifications";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import { logger } from "../api/logger";

function PriorityInbox() {
  const { viewedIds, markAsViewed } = useNotifications();
  const [sortedNotifications, setSortedNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [limit, setLimit] = useState(10);
  const [type, setType] = useState("All");

  const priorityWeight = {
    Placement: 3,
    Result: 2,
    Event: 1
  };

  // Reload priority notifications on mount, or when limit/type change
  useEffect(() => {
    loadPriorityNotifications(limit, type);
  }, [limit, type]);

  async function loadPriorityNotifications(currentLimit, currentType) {
    setLoading(true);
    setError(null);
    try {
      logger.info("PRIORITY_LOAD_START", `Loading priority inbox with limit=${currentLimit}, type=${currentType}`);
      
      // Fetch 50 notifications from the backend of the selected type.
      // This is large enough to ensure that sorting works properly and displays the top 10/15/20.
      const data = await fetchNotifications(1, 50, currentType);
      const fetched = data.notifications ?? [];
      
      // Apply priority sorting algorithm on the client
      const sorted = [...fetched].sort((a, b) => {
        const weightA = priorityWeight[a.Type] || 0;
        const weightB = priorityWeight[b.Type] || 0;

        if (weightA !== weightB) {
          return weightB - weightA;
        }

        return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
      });

      // Slice top N (limit)
      const sliced = sorted.slice(0, currentLimit);
      setSortedNotifications(sliced);

      logger.info(
        "PRIORITY_LOAD_SUCCESS",
        `Loaded and sorted priority notifications: display limit=${currentLimit}, type=${currentType}, resultsCount=${sliced.length}`
      );
    } catch (err) {
      setError(err.message || "Failed to fetch notifications for sorting");
      logger.error("PRIORITY_LOAD_ERROR", "Error inside PriorityInbox load", err);
    } finally {
      setLoading(false);
    }
  }

  const handleLimitChange = (e) => {
    const nextLimit = e.target.value;
    logger.info("USER_ACTION", `Priority limit changed to: ${nextLimit}`);
    setLimit(nextLimit);
  };

  const handleTypeChange = (nextType) => {
    logger.info("USER_ACTION", `Priority type filter changed to: ${nextType}`);
    setType(nextType);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Page Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        mb={4}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              p: 1.5,
              bgcolor: "rgba(251, 191, 36, 0.08)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 28, color: "#fbbf24" }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} color="text.primary">
              Priority Inbox
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Top prioritized notifications (Placement &gt; Result &gt; Event)
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 3, opacity: 0.1 }} />

      {/* Filters and Limit Select Bar */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        mb={3}
      >
        <NotificationFilter
          value={type}
          onChange={handleTypeChange}
        />

        <FormControl size="small" sx={{ minWidth: 150, alignSelf: { xs: "stretch", sm: "auto" } }}>
          <InputLabel id="priority-limit-label">Limit View</InputLabel>
          <Select
            labelId="priority-limit-label"
            id="priority-limit-select"
            value={limit}
            label="Limit View"
            onChange={handleLimitChange}
            sx={{
              borderRadius: 2,
              bgcolor: "background.paper",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" }
            }}
          >
            <MenuItem value={10}>Top 10</MenuItem>
            <MenuItem value={15}>Top 15</MenuItem>
            <MenuItem value={20}>Top 20</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Main Content Area */}
      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ borderRadius: 3, border: "1px solid rgba(244, 63, 94, 0.2)", bgcolor: "rgba(244, 63, 94, 0.05)" }}>
          Failed to load priority inbox: {error}
        </Alert>
      )}

      {!loading && !error && sortedNotifications.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: 3, border: "1px solid rgba(63, 140, 255, 0.2)", bgcolor: "rgba(63, 140, 255, 0.05)", color: "text.primary" }}>
          No priority notifications found matching the criteria
        </Alert>
      )}

      {!loading && !error && sortedNotifications.length > 0 && (
        <Stack spacing={2}>
          {sortedNotifications.map((n) => (
            <NotificationCard
              key={n.ID}
              notification={n}
              viewed={viewedIds.has(n.ID)}
              onMarkRead={markAsViewed}
            />
          ))}
        </Stack>
      )}
    </Container>
  );
}

export default PriorityInbox;