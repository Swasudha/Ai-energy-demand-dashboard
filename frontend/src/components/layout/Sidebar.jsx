import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';

import { NavLink } from 'react-router-dom';

import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import CloudIcon from '@mui/icons-material/Cloud';
import WarningIcon from '@mui/icons-material/Warning';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SavingsIcon from '@mui/icons-material/Savings';
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const drawerWidth = 250;

const menuItems = [
  {
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    label: 'Historical',
    icon: <HistoryIcon />,
    path: '/historical',
  },
  {
    label: 'Weather Impact',
    icon: <CloudIcon />,
    path: '/weather-impact',
  },
  {
    label: 'Anomalies',
    icon: <WarningIcon />,
    path: '/anomalies',
  },
  {
    label: 'AI Prediction',
    icon: <AutoGraphIcon />,
    path: '/prediction',
  },
  {
    label: 'What-if Scenario',
    icon: <CompareArrowsIcon />,
    path: '/scenario',
  },
  {
    label: 'Cost & Savings',
    icon: <SavingsIcon />,
    path: '/cost-savings',
  },
  {
  label: "AI Insights",
  path: "/insights",
  icon: <AutoAwesomeIcon />,
},
];

function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,

        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
        },
      }}
    >
      {/* Logo / Application Name */}
      <Toolbar>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            ⚡
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            Energy AI
          </Typography>
        </Box>
      </Toolbar>

      {/* Navigation Menu */}
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.label}
            disablePadding
            sx={{ mb: 0.5 }}
          >
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={{
                borderRadius: 2,
                mb: 0.5,

                '&:hover': {
                  backgroundColor: '#E3F2FD',
                },

                '&.active': {
                  backgroundColor: '#E3F2FD',
                  color: 'primary.main',
                  fontWeight: 700,
                },

                '&.active .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 42,
                  color: 'primary.main',
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    sx: {
                      fontWeight: 500,
                    },
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export { drawerWidth };

export default Sidebar;