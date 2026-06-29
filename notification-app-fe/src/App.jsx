import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation
} from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Badge,
  Box,
  Container,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Chip
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ShieldIcon from "@mui/icons-material/Shield";
import TerminalIcon from "@mui/icons-material/Terminal";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsPage from "./pages/NotificationsPage";
import PriorityInbox from "./pages/PriorityInbox";
import { NotificationProvider, useNotificationContext } from "./hooks/NotificationContext";
import { logger } from "./api/logger";

// Create custom theme with rich modern aesthetics (Deep Slate & Cool Blue accent)
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3f8cff",
      light: "#6fa8ff",
      dark: "#005ecb",
    },
    background: {
      default: "#0f172a", // Tailwind Slate-900 style
      paper: "#1e293b",   // Tailwind Slate-800 style
    },
    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
    },
  },
  typography: {
    fontFamily: "'Outfit', 'Inter', sans-serif",
    h5: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 16,
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(5px)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
});

function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    logger.info("ROUTER_NAVIGATION", `User navigated to ${location.pathname}`);
  }, [location]);

  return null;
}

function MainLayout() {
  const { unreadCount } = useNotificationContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (drawerOpen) {
      setLogs(logger.getLogs());
      const interval = setInterval(() => {
        setLogs(logger.getLogs());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [drawerOpen]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", background: "#0f172aff" }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ShieldIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 800, background: "linear-gradient(90deg, #3f8cff, #88b7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                CampusGuard
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                component={NavLink}
                to="/"
                sx={{
                  color: "text.primary",
                  "&.active": {
                    color: "primary.main",
                    backgroundColor: "rgba(63, 140, 255, 0.08)"
                  }
                }}
              >
                Notifications
              </Button>
              <Button
                component={NavLink}
                to="/priority"
                sx={{
                  color: "text.primary",
                  "&.active": {
                    color: "primary.main",
                    backgroundColor: "rgba(63, 140, 255, 0.08)"
                  }
                }}
              >
                Priority Inbox
              </Button>

              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsIcon sx={{ color: "text.primary" }} />
              </Badge>

              <IconButton
                onClick={() => setDrawerOpen(true)}
                color="inherit"
                title="View Logging Middleware Logs"
                sx={{ ml: 1, border: "1px solid rgba(255, 255, 255, 0.12)" }}
              >
                <TerminalIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Routes>
          <Route path="/" element={<NotificationsPage />} />
          <Route path="/priority" element={<PriorityInbox />} />
        </Routes>
      </Box>

      {/* Logging Middleware Console Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 550 }, bgcolor: "#0f172a", borderLeft: "1px solid rgba(255, 255, 255, 0.08)" }
        }}
      >
        <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <HistoryIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Logging Middleware Stream
              </Typography>
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)} color="inherit">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => {
                logger.clearLogs();
                setLogs([]);
              }}
            >
              Clear Logs
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center", ml: "auto" }}>
              Showing last {logs.length} logs
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column-reverse", gap: 1.5, pr: 1 }}>
            {logs.slice().reverse().map((log, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "#1e293b",
                  borderLeft: `4px solid ${
                    log.level === "ERROR" ? "#f43f5e" : log.level === "WARN" ? "#eab308" : "#3f8cff"
                  }`,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Chip
                    label={log.level}
                    size="small"
                    color={log.level === "ERROR" ? "error" : log.level === "WARN" ? "warning" : "primary"}
                    sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontFamily: "monospace", fontSize: "0.8rem", color: "text.primary" }}>
                  {log.context}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: "0.85rem" }}>
                  {log.message}
                </Typography>
                {log.details && (
                  <Box component="pre" sx={{ mt: 1, p: 1, bgcolor: "#0f172a", borderRadius: 1, fontSize: "0.75rem", overflowX: "auto", fontFamily: "monospace", color: "#6fa8ff" }}>
                    {JSON.stringify(log.details, null, 2)}
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NotificationProvider>
          <NavigationTracker />
          <MainLayout />
        </NotificationProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;