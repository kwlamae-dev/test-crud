import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Chip,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';

const DRAWER_WIDTH = 250;

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/', icon: DashboardRoundedIcon, end: true },
  { label: 'Products', to: '/products', icon: Inventory2RoundedIcon },
  { label: 'Users', to: '/users', icon: PeopleRoundedIcon },
  { label: 'Orders', to: '/orders', icon: ReceiptLongRoundedIcon },
];

function SidebarContent({ onNavigate }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', px: 2.5, py: 2.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 8px 18px rgba(79, 70, 229, 0.28)',
          }}
        >
          <Inventory2RoundedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>Store Admin</Typography>
          <Typography variant="caption" color="text.secondary">
            CRUD demo
          </Typography>
        </Box>
      </Stack>

      <List sx={{ px: 1.5, pt: 1 }}>
        {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
          <ListItem key={to} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={to}
              end={end}
              onClick={onNavigate}
              sx={{
                borderRadius: 2,
                py: 1.1,
                color: 'text.secondary',
                '& .MuiListItemIcon-root': { color: 'inherit' },
                '&.active': {
                  bgcolor: 'primary.main',
                  color: '#fff',
                  boxShadow: '0 6px 16px rgba(79, 70, 229, 0.25)',
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={label}
                slotProps={{ primary: { sx: { fontWeight: 600, fontSize: 14 } } }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Box
          sx={{
            p: 1.75,
            borderRadius: 2.5,
            bgcolor: '#f8fafc',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
            <StorageRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Express + SQLite
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Products, users and orders share one relational database.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function AppLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const current =
    NAV_ITEMS.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
    ) ?? NAV_ITEMS[0];

  const handleNavigate = () => setMobileOpen(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {!isDesktop && (
            <IconButton
              edge="start"
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
            >
              <MenuRoundedIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap>
            {current.label}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            size="small"
            icon={<StorageRoundedIcon />}
            label="SQLite API"
            variant="outlined"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          />
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop ? true : mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            },
          }}
        >
          <SidebarContent onNavigate={handleNavigate} />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          p: { xs: 2, sm: 3, lg: 4 },
        }}
      >
        <Toolbar />
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
