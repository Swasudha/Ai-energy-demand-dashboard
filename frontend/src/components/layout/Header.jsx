import { useState } from 'react';

import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';

import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';

import { drawerWidth } from './Sidebar';

function Header() {
  const [selectedState, setSelectedState] = useState('Tamil Nadu');

  const handleStateChange = (event) => {
    setSelectedState(event.target.value);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        backgroundColor: '#FFFFFF',
        color: 'text.primary',
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      <Toolbar sx={{ minHeight: '70px !important' }}>
        {/* Application title */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <ElectricBoltIcon
            sx={{
              color: 'primary.main',
              fontSize: 28,
            }}
          />

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            AI Energy Demand Analytics
          </Typography>
        </Box>

        {/* Right side */}
        <Box
          sx={{
            ml: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* State selector */}
          <FormControl size="small">
            <Select
              value={selectedState}
              onChange={handleStateChange}
              sx={{
                minWidth: 150,
                borderRadius: 2,
              }}
            >
              <MenuItem value="Tamil Nadu">
                Tamil Nadu
              </MenuItem>

              <MenuItem value="Kerala">
                Kerala
              </MenuItem>

              <MenuItem value="Karnataka">
                Karnataka
              </MenuItem>

              <MenuItem value="Andhra Pradesh">
                Andhra Pradesh
              </MenuItem>

              <MenuItem value="Telangana">
                Telangana
              </MenuItem>
            </Select>
          </FormControl>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton>
              <NotificationsNoneIcon />
            </IconButton>
          </Tooltip>

          {/* Profile */}
          <Tooltip title="Profile">
            <IconButton>
              <AccountCircleOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;