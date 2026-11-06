import { Avatar, Stack, Typography } from '@mui/material';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <Stack spacing={1.25} sx={{ alignItems: 'center', py: 8, px: 3, textAlign: 'center' }}>
      {icon && (
        <Avatar
          sx={{
            width: 56,
            height: 56,
            bgcolor: 'rgba(79, 70, 229, 0.1)',
            color: 'primary.main',
            mb: 0.5,
          }}
        >
          {icon}
        </Avatar>
      )}
      <Typography variant="h6">{title}</Typography>
      {description && (
        <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      )}
      {action && <Stack sx={{ pt: 1 }}>{action}</Stack>}
    </Stack>
  );
}
