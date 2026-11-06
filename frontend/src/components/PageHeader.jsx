import { Box, Stack, Typography } from '@mui/material';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{
        mb: 3,
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' } }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ mt: 0.6 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
}
