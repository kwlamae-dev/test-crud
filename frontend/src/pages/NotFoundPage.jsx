import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import SentimentDissatisfiedRoundedIcon from '@mui/icons-material/SentimentDissatisfiedRounded';

export default function NotFoundPage() {
  return (
    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <SentimentDissatisfiedRoundedIcon sx={{ fontSize: 64, color: 'primary.main' }} />
        <Typography variant="h4">Page not found</Typography>
        <Box>
          <Typography color="text.secondary">
            The page you are looking for does not exist.
          </Typography>
        </Box>
        <Button component={Link} to="/" variant="contained">
          Back to dashboard
        </Button>
      </Stack>
    </Paper>
  );
}
