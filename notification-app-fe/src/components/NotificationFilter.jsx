import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { logger } from "../api/logger";

const filters = ["All", "Placement", "Result", "Event"];

export function NotificationFilter({ value, onChange }) {
  const handleChange = (_, newValue) => {
    if (newValue !== null) {
      logger.info("USER_ACTION", `Changed category filter to: ${newValue}`);
      onChange(newValue);
    }
  };

  return (
    <ToggleButtonGroup
      value={value || "All"}
      exclusive
      onChange={handleChange}
      size="small"
      color="primary"
      sx={{
        flexWrap: "wrap",
        gap: 0.5,
        "& .MuiToggleButtonGroup-grouped": {
          border: "1px solid rgba(255, 255, 255, 0.08) !important",
          borderRadius: "8px !important",
          mx: 0.5,
          color: "text.secondary",
          "&.Mui-selected": {
            color: "primary.main",
            bgcolor: "rgba(63, 140, 255, 0.12)",
            borderColor: "primary.main"
          }
        }
      }}
    >
      {filters.map((type) => (
        <ToggleButton key={type} value={type} sx={{ textTransform: "none", px: 3, py: 1 }}>
          {type}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}