import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useUsers } from '../hooks/useUsers.ts';
import { useUiStore } from '../store/useUiStore.ts';
import CreateUserDialog from '../components/CreateUserDialog.tsx';

export default function UserListPage() {
  const navigate = useNavigate();
  const { data: users, isLoading, isError, error } = useUsers();
  const openCreate = useUiStore((s) => s.openCreateUserDialog);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">Failed to load users: {error.message}</Alert>;
  }

  const rows = users ?? [];

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Typography variant="h4" component="h1">
          Users
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Create user
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>First name</TableCell>
              <TableCell>Last name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((u) => (
              <TableRow
                key={u.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/users/${u.id}`)}
              >
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.firstName}</TableCell>
                <TableCell>{u.lastName}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/users/${u.id}`);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No users to display.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CreateUserDialog />
    </Box>
  );
}
