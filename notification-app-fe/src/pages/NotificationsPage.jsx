import { useEffect } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DoneAllIcon from "@mui/icons-material/DoneAll";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import { logger } from "../api/logger";

export function NotificationsPage() {
  const {
    notifications,
    total,
    totalPages,
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
    unreadCount
  } = useNotifications();

  const handleFilterChange = (newFilter) => {
    logger.info("USER_ACTION", `Changed filter type on NotificationsPage to: ${newFilter}`);
    setType(newFilter);
    setPage(1); // Reset page on filter change
  };

  const handlePageChange = (_, newPage) => {
    logger.info("USER_ACTION", `Navigated to page: ${newPage}`);
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    const newLimit = e.target.value;
    logger.info("USER_ACTION", `Changed page limit to: ${newLimit}`);
    setLimit(newLimit);
    setPage(1); // Reset page to 1
  };

  // Log on initial mount
  useEffect(() => {
    logger.info("PAGE_MOUNT", "NotificationsPage rendered");
  }, []);

  return (
    <Box sx={{ maxWidth: 850, mx: "auto", px: { xs: 2, md: 4 }, py: 2 }}>
      {/* Page Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        mb={4}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <Box
              sx={{
                p: 1.5,
                bgcolor: "rgba(63, 140, 255, 0.08)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <NotificationsIcon sx={{ fontSize: 28, color: "primary.main" }} />
            </Box>
          </Badge>
          <Box>
            <Typography variant="h5" fontWeight={800} color="text.primary">
              System Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time campus placement and result updates
            </Typography>
          </Box>
        </Stack>

        {unreadCount > 0 && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DoneAllIcon />}
            onClick={markAllAsViewed}
            size="small"
            sx={{ border: "1px solid rgba(63, 140, 255, 0.24)", "&:hover": { bgcolor: "rgba(63, 140, 255, 0.04)" } }}
          >
            Mark All Read
          </Button>
        )}
      </Stack>

      <Divider sx={{ mb: 3, opacity: 0.1 }} />

      {/* Filters and Limit Select Bar */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={2}
        mb={3}
      >
        <NotificationFilter
          value={type}
          onChange={handleFilterChange}
        />

        <FormControl size="small" sx={{ minWidth: 140, alignSelf: { xs: "stretch", sm: "auto" } }}>
          <InputLabel id="limit-select-label">Items Per Page</InputLabel>
          <Select
            labelId="limit-select-label"
            id="limit-select"
            value={limit}
            label="Items Per Page"
            onChange={handleLimitChange}
            sx={{
              borderRadius: 2,
              bgcolor: "background.paper",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" }
            }}
          >
            <MenuItem value={5}>5 per page</MenuItem>
            <MenuItem value={10}>10 per page</MenuItem>
            <MenuItem value={15}>15 per page</MenuItem>
            <MenuItem value={20}>20 per page</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Content Area */}
      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ borderRadius: 3, border: "1px solid rgba(244, 63, 94, 0.2)", bgcolor: "rgba(244, 63, 94, 0.05)" }}>
          Failed to load notifications: {error}
        </Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: 3, border: "1px solid rgba(63, 140, 255, 0.2)", bgcolor: "rgba(63, 140, 255, 0.05)", color: "text.primary" }}>
          No notifications found matching your selection
        </Alert>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={2}>
          {notifications.map((n) => (
            <NotificationCard
              key={n.ID}
              notification={n}
              viewed={viewedIds.has(n.ID)}
              onMarkRead={markAsViewed}
            />
          ))}
        </Stack>
      )}

      {/* Pagination Footer */}
      {!loading && !error && notifications.length > 0 && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} flexWrap="wrap" gap={2}>
          <Typography variant="body2" color="text.secondary">
            Showing {notifications.length} of {total} notifications
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            size="medium"
          />
        </Box>
      )}
    </Box>
  );
}

export default NotificationsPage;