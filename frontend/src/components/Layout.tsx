import { Outlet } from 'react-router-dom';
import { Alert, Box, Container, Snackbar } from '@mui/material';
import { useUiStore } from '../store/useUiStore.ts';

export default function Layout() {
  const snackbar = useUiStore((s) => s.snackbar);
  const closeSnackbar = useUiStore((s) => s.closeSnackbar);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, flexGrow: 1 }}>
        <Outlet />
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
