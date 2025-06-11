import React from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Box,
  Stack
} from '@mui/material';
import {
  RocketLaunch,
  Visibility,
  Edit,
  Bookmark,
  Chat,
  Star,
  Map,
  PhotoCamera,
  Backpack
} from '@mui/icons-material';
import './Home.css';

function Home() {
  const stats = [
    { icon: '✈️', number: '1000+', label: 'Travel Stories' },
    { icon: '👥', number: '500+', label: 'Travelers' },
    { icon: '🌎', number: '100+', label: 'Countries' }
  ];

  const features = [
    {
      icon: <Edit sx={{ fontSize: 48 }} />,
      title: 'Share Your Adventures',
      description: 'Create beautiful travel logs with photos, stories, and tips. Inspire others with your unique experiences.'
    },
    {
      icon: <Bookmark sx={{ fontSize: 48 }} />,
      title: 'Save & Organize',
      description: 'Bookmark amazing destinations and stories. Build your personal collection of travel inspiration.'
    },
    {
      icon: <Chat sx={{ fontSize: 48 }} />,
      title: 'Connect & Discuss',
      description: 'Comment, share experiences, and get advice from fellow travelers. Build lasting connections.'
    },
    {
      icon: <Star sx={{ fontSize: 48 }} />,
      title: 'Discover Hidden Gems',
      description: 'Find off-the-beaten-path destinations and authentic local experiences shared by real travelers.'
    },
    {
      icon: <Map sx={{ fontSize: 48 }} />,
      title: 'Plan Your Next Trip',
      description: 'Get inspired by others\' journeys and use their insights to plan your own perfect adventure.'
    },
    {
      icon: <PhotoCamera sx={{ fontSize: 48 }} />,
      title: 'Visual Storytelling',
      description: 'Share stunning photos and create visual narratives that bring your travel memories to life.'
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <Container maxWidth="lg">
          <Box className="hero-content">
            <div className="hero-logo">
              🌍
            </div>
            <Typography 
              variant="h1" 
              className="hero-title"
              sx={{ 
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                fontWeight: 800,
                mb: 2,
                lineHeight: 1.1
              }}
            >
              Welcome to the Travel Enthusiasts' Network!
            </Typography>
            <Typography 
              variant="h5" 
              className="hero-subtitle"
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                mb: 4,
                opacity: 0.9,
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Explore travel logs, share experiences, and connect with fellow adventurers from around the globe!
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              justifyContent="center" 
              className="hero-stats"
              sx={{ mb: 4 }}
            >
              {stats.map((stat, index) => (
                <Box key={index} className="stat-item">
                  <Typography variant="h4" component="span" className="stat-icon">
                    {stat.icon}
                  </Typography>
                  <Typography variant="h4" component="span" className="stat-number">
                    {stat.number}
                  </Typography>
                  <Typography variant="body2" component="span" className="stat-label">
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
              className="hero-actions"
            >
              <Button
                component={Link}
                to="/register"
                variant="contained"
                size="large"
                startIcon={<RocketLaunch />}
                className="cta-button primary"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 2
                }}
              >
                Start Your Journey
              </Button>
              <Button
                component={Link}
                to="/all-logs"
                variant="outlined"
                size="large"
                startIcon={<Visibility />}
                className="cta-button secondary"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Explore Stories
              </Button>
            </Stack>
          </Box>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            className="features-title"
            sx={{ 
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 700,
              textAlign: 'center',
              mb: 6,
              color: 'var(--text-primary)'
            }}
          >
            Why Join Our Community?
          </Typography>
          
          <Grid 
            container 
            spacing={3} 
            className="features-grid"
            justifyContent="center"
            alignItems="stretch"
          >
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} lg={4} key={index}>
                <Card 
                  className="feature-card"
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 1,
                    borderRadius: 2,
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border-light)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    maxWidth: 400,
                    mx: 'auto',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 'var(--shadow-xl)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, flexGrow: 1 }}>
                    <Box 
                      className="feature-icon" 
                      sx={{ 
                        color: 'var(--primary-color)',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography 
                      variant="h5" 
                      className="feature-title"
                      sx={{ 
                        fontWeight: 600,
                        mb: 1,
                        color: 'var(--text-primary)'
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      className="feature-description"
                      sx={{ 
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container maxWidth="md">
          <Box className="cta-content" sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h2" 
              className="cta-title"
              sx={{ 
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 700,
                mb: 2,
                color: 'var(--text-primary)'
              }}
            >
              Ready to Start Your Adventure?
            </Typography>
            <Typography 
              variant="h6" 
              className="cta-subtitle"
              sx={{ 
                fontSize: { xs: '1rem', md: '1.25rem' },
                color: 'var(--text-secondary)',
                mb: 4,
                lineHeight: 1.6
              }}
            >
              Join thousands of travelers sharing their stories and discovering new destinations every day.
            </Typography>
            <Stack spacing={2} alignItems="center" className="cta-actions">
              <Button
                component={Link}
                to="/register"
                variant="contained"
                size="large"
                startIcon={<Backpack />}
                className="cta-button large primary"
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  minWidth: 280
                }}
              >
                Join the Community
              </Button>
              <Typography 
                variant="body2" 
                className="cta-note"
                sx={{ color: 'var(--text-light)' }}
              >
                Already a member?{' '}
                <Typography
                  component={Link}
                  to="/login"
                  sx={{
                    color: 'var(--primary-color)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      color: 'var(--primary-hover)',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Sign in here
                </Typography>
              </Typography>
            </Stack>
          </Box>
        </Container>
      </section>
    </div>
  );
}

export default Home;