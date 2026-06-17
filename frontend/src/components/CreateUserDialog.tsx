import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material';
import { useUiStore } from '../store/useUiStore.ts';
import { useCreateUser } from '../hooks/useCreateUser.ts';
import {
  hasUserFieldErrors,
  trimUserFields,
  validateUserFields,
  type UserFieldErrors,
} from '../lib/userValidation.ts';

export default function CreateUserDialog() {
  const open = useUiStore((s) => s.createUserDialogOpen);
  const draft = useUiStore((s) => s.newUserDraft);
  const updateDraft = useUiStore((s) => s.updateNewUserDraft);
  const close = useUiStore((s) => s.closeCreateUserDialog);
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  const createUser = useCreateUser();
  const [errors, setErrors] = useState<UserFieldErrors>({});

  const saving = createUser.isPending;

  function handleClose() {
    if (saving) return;
    setErrors({});
    close();
  }

  async function handleSubmit() {
    const fieldErrors = validateUserFields(draft);
    setErrors(fieldErrors);
    if (hasUserFieldErrors(fieldErrors)) return;

    try {
      const created = await createUser.mutateAsync(trimUserFields(draft));
      showSnackbar('success', `User ${created.firstName} created.`);
      setErrors({});
      close();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      // Surface server-side email-collision as a field error so it lives next
      // to the input, not just in the transient snackbar.
      if (message.toLowerCase().includes('email')) {
        setErrors((prev) => ({ ...prev, email: message }));
      }
      showSnackbar('error', `Create failed: ${message}`);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create user</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First name"
              fullWidth
              value={draft.firstName}
              onChange={(e) => updateDraft({ firstName: e.target.value })}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName}
              disabled={saving}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last name"
              fullWidth
              value={draft.lastName}
              onChange={(e) => updateDraft({ lastName: e.target.value })}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName}
              disabled={saving}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={draft.email}
              onChange={(e) => updateDraft({ email: e.target.value })}
              error={Boolean(errors.email)}
              helperText={errors.email}
              disabled={saving}
              inputProps={{ maxLength: 100 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving}>
          {saving ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
