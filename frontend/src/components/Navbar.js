import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Typography, 
  Box,
  Fade
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
import './Navbar.css'; // Importing the enhanced CSS file

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll events for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Travel-themed logo component with compass design
  const TravelLogo = () => (
    <Box className="logo-icon">
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ 
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
          transition: 'all 0.4s ease'
        }}
      >
        {/* Outer compass ring */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="url(#compassRing)"
          stroke="#fff"
          strokeWidth="2"
        />
        
        {/* Inner compass face */}
        <circle 
          cx="50" 
          cy="50" 
          r="35" 
          fill="url(#compassFace)"
          stroke="#fff"
          strokeWidth="1.5"
        />
        
        {/* Compass rose - North (red) */}
        <path 
          d="M50 15 L55 45 L50 40 L45 45 Z" 
          fill="#e53935"
          stroke="#fff"
          strokeWidth="1"
        />
        
        {/* Compass rose - South (white) */}
        <path 
          d="M50 85 L55 55 L50 60 L45 55 Z" 
          fill="#fff"
          stroke="#333"
          strokeWidth="1"
        />
        
        {/* Compass rose - East (red) */}
        <path 
          d="M85 50 L55 45 L60 50 L55 55 Z" 
          fill="#e53935"
          stroke="#fff"
          strokeWidth="1"
        />
        
        {/* Compass rose - West (white) */}
        <path 
          d="M15 50 L45 45 L40 50 L45 55 Z" 
          fill="#fff"
          stroke="#333"
          strokeWidth="1"
        />
        
        {/* Cardinal direction markers */}
        <text x="50" y="12" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">N</text>
        <text x="88" y="54" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">E</text>
        <text x="50" y="92" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">S</text>
        <text x="12" y="54" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">W</text>
        
        {/* Center pivot */}
        <circle 
          cx="50" 
          cy="50" 
          r="4" 
          fill="url(#centerPivot)"
          stroke="#fff"
          strokeWidth="1"
        />
        
        {/* Decorative elements */}
        <circle cx="50" cy="22" r="1.5" fill="#ffd700" />
        <circle cx="78" cy="50" r="1.5" fill="#ffd700" />
        <circle cx="50" cy="78" r="1.5" fill="#ffd700" />
        <circle cx="22" cy="50" r="1.5" fill="#ffd700" />
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="compassRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8d6e63" />
            <stop offset="50%" stopColor="#5d4037" />
            <stop offset="100%" stopColor="#3e2723" />
          </linearGradient>
          
          <linearGradient id="compassFace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5f5dc" />
            <stop offset="50%" stopColor="#f0e68c" />
            <stop offset="100%" stopColor="#daa520" />
          </linearGradient>
          
          <radialGradient id="centerPivot">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#b8860b" />
          </radialGradient>
        </defs>
      </svg>
    </Box>
  );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // Add a small delay for better UX
    setTimeout(() => {
      localStorage.removeItem('token');
      setIsLoggingOut(false);
      navigate('/');
    }, 800);
  };

  // Helper function to check if current route matches button
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Enhanced button component with active state and tooltip
  const NavButton = ({ 
    to, 
    onClick, 
    icon, 
    children, 
    className = "", 
    tooltip,
    isActive = false,
    isLoading = false,
    ...props 
  }) => {
    const buttonProps = {
      color: "inherit",
      startIcon: icon,
      className: `nav-button ${className} ${isActive ? 'active' : ''} ${isLoading ? 'loading' : ''}`,
      'data-tooltip': tooltip,
      ...props
    };

    if (to) {
      return (
        <Button
          component={Link}
          to={to}
          {...buttonProps}
        >
          {children}
        </Button>
      );
    }

    return (
      <Button
        onClick={onClick}
        {...buttonProps}
      >
        {children}
      </Button>
    );
  };

  return (
    <Fade in={true} timeout={1000}>
      <AppBar 
        position="fixed" 
        className={`navbar ${isScrolled ? 'scrolled' : ''}`}
        elevation={isScrolled ? 12 : 8}
        sx={{
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Toolbar sx={{ 
          justifyContent: 'space-between', 
          transition: 'all 0.3s ease',
        }}>
          {/* Logo/Brand with travel icon */}
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            className="logo"
            sx={{
              background: 'linear-gradient(45deg, #fff, #ffd700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: location.pathname === '/' ? 'pulse 2s infinite' : 'none',
            }}
          >
            <TravelLogo />
            Travel Tribe
          </Typography>

          {/* Navigation Links */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, sm: 1.5, md: 2 },
            flexWrap: 'nowrap'
          }}>
            {/* Public Links */}
            <NavButton
              to="/"
              icon={<HomeIcon />}
              tooltip="Go to Home"
              isActive={isActiveRoute('/')}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Home
            </NavButton>
            
            <NavButton
              to="/all-logs"
              icon={<PublicIcon />}
              tooltip="View All Travel Logs"
              isActive={isActiveRoute('/all-logs')}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                All Logs
              </Box>
            </NavButton>

            {isLoggedIn ? (
              // Authenticated User Links
              <>
                <NavButton
                  to="/dashboard"
                  icon={<DashboardIcon />}
                  tooltip="Your Dashboard"
                  isActive={isActiveRoute('/dashboard')}
                  sx={{ display: { xs: 'none', md: 'flex' } }}
                >
                  Dashboard
                </NavButton>
                
                <NavButton
                  to="/create-log"
                  icon={<CreateIcon />}
                  tooltip="Create New Travel Log"
                  isActive={isActiveRoute('/create-log')}
                  sx={{ display: { xs: 'none', md: 'flex' } }}
                >
                  Create
                </NavButton>
                
                <NavButton
                  to="/saved-logs"
                  icon={<BookmarkIcon />}
                  tooltip="Your Saved Logs"
                  isActive={isActiveRoute('/saved-logs')}
                  className="saved-button"
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    Saved
                  </Box>
                </NavButton>
                
                <NavButton
                  onClick={handleLogout}
                  icon={<LogoutIcon />}
                  tooltip="Sign Out"
                  className="logout-button"
                  isLoading={isLoggingOut}
                  disabled={isLoggingOut}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </Box>
                </NavButton>
              </>
            ) : (
              // Guest User Links
              <>
                <NavButton
                  to="/login"
                  icon={<LoginIcon />}
                  tooltip="Sign In to Your Account"
                  isActive={isActiveRoute('/login')}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    Login
                  </Box>
                </NavButton>
                
                <NavButton
                  to="/register"
                  icon={<RegisterIcon />}
                  tooltip="Create New Account"
                  isActive={isActiveRoute('/register')}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    Register
                  </Box>
                </NavButton>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Fade>
  );
}

export default Navbar;