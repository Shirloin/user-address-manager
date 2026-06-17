import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  List,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import AddressListItem from '../components/AddressListItem.tsx';
import AddressDialog from '../components/AddressDialog.tsx';
import ConfirmDialog from '../components/ConfirmDialog.tsx';
import { useUserDetail } from '../hooks/useUserDetail.ts';
import { useUpdateUser } from '../hooks/useUpdateUser.ts';
import { useDeleteAddress } from '../hooks/useDeleteAddress.ts';
import { useUiStore } from '../store/useUiStore.ts';
import {
  hasUserFieldErrors,
  trimUserFields,
  validateUserFields,
  type UserFieldErrors,
} from '../lib/userValidation.ts';
import type { UpdateUserPayload } from '../types/domain.ts';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, isError, error } = useUserDetail(id);
  const updateUser = useUpdateUser(id ?? '');
  const deleteAddress = useDeleteAddress(id ?? '');

  const openAdd = useUiStore((s) => s.openAddAddressDialog);
  const openEdit = useUiStore((s) => s.openEditAddressDialog);
  const requestDelete = useUiStore((s) => s.requestDeleteAddress);
  const cancelDelete = useUiStore((s) => s.cancelDeleteAddress);
  const pendingDeleteId = useUiStore((s) => s.pendingDeleteAddressId);
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  // Local profile draft is UI-only. We re-seed it from the query cache on
  // every fetch so the user can type freely without leaking the draft into
  // anything global.
  const [profile, setProfile] = useState<UpdateUserPayload>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [profileErrors, setProfileErrors] = useState<UserFieldErrors>({});

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
      setProfileErrors({});
    }
  }, [user]);

  async function handleProfileSave() {
    if (!id) return;
    const fieldErrors = validateUserFields(profile);
    setProfileErrors(fieldErrors);
    if (hasUserFieldErrors(fieldErrors)) return;

    try {
      await updateUser.mutateAsync(trimUserFields(profile));
      showSnackbar('success', 'Profile saved.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.toLowerCase().includes('email')) {
        setProfileErrors((prev) => ({ ...prev, email: message }));
      }
      showSnackbar('error', `Save failed: ${message}`);
    }
  }

  async function handleDeleteConfirm() {
    const target = pendingDeleteId;
    if (!target) return;
    cancelDelete();
    try {
      await deleteAddress.mutateAsync(target);
      showSnackbar('success', 'Address deleted.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showSnackbar('error', `Delete failed: ${message}`);
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !user || !id) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2 }}>
          Back to users
        </Button>
        <Alert severity="error">{error?.message ?? 'User not found.'}</Alert>
      </Box>
    );
  }

  const addressToDelete = user.addresses.find((a) => a.id === pendingDeleteId);

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2 }}>
        Back to users
      </Button>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Profile
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First name"
              fullWidth
              value={profile.firstName}
              onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
              error={Boolean(profileErrors.firstName)}
              helperText={profileErrors.firstName}
              disabled={updateUser.isPending}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last name"
              fullWidth
              value={profile.lastName}
              onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
              error={Boolean(profileErrors.lastName)}
              helperText={profileErrors.lastName}
              disabled={updateUser.isPending}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              error={Boolean(profileErrors.email)}
              helperText={profileErrors.email}
              disabled={updateUser.isPending}
              inputProps={{ maxLength: 100 }}
            />
          </Grid>
        </Grid>
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleProfileSave}
            disabled={updateUser.isPending}
          >
            {updateUser.isPending ? 'Saving…' : 'Save profile'}
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Typography variant="h5" component="h2">
            Addresses
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
            Add address
          </Button>
        </Stack>
        <Divider />
        {user.addresses.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography>No addresses yet. Add the first one above.</Typography>
          </Box>
        ) : (
          <List>
            {user.addresses.map((a) => (
              <AddressListItem
                key={a.id}
                address={a}
                onEdit={openEdit}
                onDelete={(addr) => requestDelete(addr.id)}
              />
            ))}
          </List>
        )}
      </Paper>

      <AddressDialog userId={id} />

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Delete address?"
        message={
          addressToDelete
            ? `Delete the address at ${addressToDelete.street}, ${addressToDelete.city}? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        busy={deleteAddress.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={cancelDelete}
      />
    </Box>
  );
}
