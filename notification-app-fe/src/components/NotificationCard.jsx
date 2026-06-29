import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip
} from "@mui/material";
import WorkIcon from "@mui/icons-material/BusinessCenter";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoneAllIcon from "@mui/icons-material/DoneAll";

// Category Icons lookup
const CATEGORY_ICONS = {
  Placement: <WorkIcon sx={{ color: "#10b981" }} />, // emerald
  Result: <SchoolIcon sx={{ color: "#3f8cff" }} />,    // blue
  Event: <EventIcon sx={{ color: "#f59e0b" }} />,      // amber
};

const CATEGORY_COLORS = {
  Placement: "success",
  Result: "primary",
  Event: "warning",
};

export function NotificationCard({ notification, viewed, onMarkRead }) {
  const icon = CATEGORY_ICONS[notification.Type] || <EventIcon />;
  const color = CATEGORY_COLORS[notification.Type] || "default";

  // format human readable timestamp
  const dateStr = new Date(notification.Timestamp).toLocaleString();

  return (
    <Card
      sx={{
        position: "relative",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 12px 20px rgba(0,0,0,0.4)",
          borderColor: viewed ? "rgba(255,255,255,0.16)" : "primary.main",
        },
        bgcolor: viewed ? "#1e293b99" : "#1e293bff",
        borderLeft: viewed ? "4px solid rgba(255, 255, 255, 0.12)" : "4px solid #3f8cff",
      }}
    >
      <CardContent sx={{ display: "flex", gap: 2.5, alignItems: "flex-start", pr: 7 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary" }}>
              {notification.Type}
            </Typography>
            <Chip
              label={notification.Type}
              size="small"
              color={color}
              variant="outlined"
              sx={{ height: 18, fontSize: "0.7rem", display: "none" }} // Hidden but structured
            />
            {viewed ? (
              <Chip
                label="Viewed"
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: "0.7rem", color: "text.secondary", borderColor: "rgba(255,255,255,0.1)" }}
              />
            ) : (
              <Chip
                label="New"
                size="small"
                color="primary"
                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
              />
            )}
          </Box>

          <Typography variant="body1" color="text.primary" sx={{ mb: 1, fontWeight: 500 }}>
            {notification.Message}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {dateStr}
          </Typography>
        </Box>
      </CardContent>

      {!viewed && onMarkRead && (
        <Box sx={{ position: "absolute", right: 12, top: 12 }}>
          <Tooltip title="Mark as Read">
            <IconButton
              onClick={() => onMarkRead(notification.ID)}
              color="primary"
              sx={{
                bgcolor: "rgba(63, 140, 255, 0.08)",
                "&:hover": { bgcolor: "rgba(63, 140, 255, 0.2)" },
              }}
            >
              <CheckCircleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {viewed && (
        <Box sx={{ position: "absolute", right: 16, top: 16, opacity: 0.4 }}>
          <DoneAllIcon fontSize="small" color="disabled" />
        </Box>
      )}
    </Card>
  );
}

export default NotificationCard;