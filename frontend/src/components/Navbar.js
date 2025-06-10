import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Typography, 
  Box,
  IconButton
} from '@mui/material';
import { 
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Create as CreateIcon,
  Public as PublicIcon,
  Bookmark as BookmarkIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon
} from '@mui/icons-material';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo/Brand */}
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
            textDecoration: 'none', 
            color: 'inherit',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          🌍 Travel Network
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Public Links */}
          <Button 
            color="inherit" 
            component={Link} 
            to="/"
            startIcon={<HomeIcon />}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Home
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/all-logs"
            startIcon={<PublicIcon />}
          >
            All Logs
          </Button>

          {isLoggedIn ? (
            // Authenticated User Links
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/dashboard"
                startIcon={<DashboardIcon />}
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                Dashboard
              </Button>
              
              <Button 
                color="inherit" 
                component={Link} 
                to="/create-log"
                startIcon={<CreateIcon />}
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                Create
              </Button>
              
              <Button 
                color="inherit" 
                component={Link} 
                to="/saved-logs"
                startIcon={<BookmarkIcon />}
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}
              >
                Saved
              </Button>
              
              <Button 
                color="inherit" 
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{ 
                  ml: 1,
                  backgroundColor: '#d32f2f',
                  '&:hover': { backgroundColor: '#b71c1c' }
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            // Guest User Links
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/login"
                startIcon={<LoginIcon />}
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}
              >
                Login
              </Button>
              
              <Button 
                color="inherit" 
                component={Link} 
                to="/register"
                startIcon={<RegisterIcon />}
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>

        {/* Mobile Menu (Optional - for very small screens) */}
        {isLoggedIn && (
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton 
              color="inherit" 
              component={Link} 
              to="/dashboard"
              title="Dashboard"
            >
              <DashboardIcon />
            </IconButton>
            <IconButton 
              color="inherit" 
              component={Link} 
              to="/create-log"
              title="Create Log"
            >
              <CreateIcon />
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;