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
import { useAddAddress } from '../hooks/useAddAddress.ts';
import { useUpdateAddress } from '../hooks/useUpdateAddress.ts';
import type { AddressPayload } from '../types/domain.ts';

interface AddressDialogProps {
  userId: string;
}

const FIELDS: ReadonlyArray<keyof AddressPayload> = [
  'street',
  'city',
  'state',
  'zip',
  'country',
];

type FieldErrors = Partial<Record<keyof AddressPayload, string>>;

export default function AddressDialog({ userId }: AddressDialogProps) {
  const open = useUiStore((s) => s.addressDialogOpen);
  const editingId = useUiStore((s) => s.editingAddressId);
  const draft = useUiStore((s) => s.addressDraft);
  const updateDraft = useUiStore((s) => s.updateAddressDraft);
  const close = useUiStore((s) => s.closeAddressDialog);
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  const addMutation = useAddAddress(userId);
  const updateMutation = useUpdateAddress(userId);

  const [errors, setErrors] = useState<FieldErrors>({});
  const editing = editingId !== null;
  const saving = addMutation.isPending || updateMutation.isPending;

  function validate(): boolean {
    const next: FieldErrors = {};
    FIELDS.forEach((field) => {
      if (!draft[field] || !draft[field].trim()) {
        next[field] = 'Required';
      }
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleClose() {
    if (saving) return;
    setErrors({});
    close();
  }

  async function handleSubmit() {
    if (!validate()) return;
    const payload: AddressPayload = {
      street: draft.street.trim(),
      city: draft.city.trim(),
      state: draft.state.trim(),
      zip: draft.zip.trim(),
      country: draft.country.trim(),
    };

    try {
      if (editing && editingId) {
        await updateMutation.mutateAsync({ addressId: editingId, payload });
        showSnackbar('success', 'Address updated.');
      } else {
        await addMutation.mutateAsync(payload);
        showSnackbar('success', 'Address added.');
      }
      setErrors({});
      close();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showSnackbar('error', `${editing ? 'Update' : 'Add'} failed: ${message}`);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{editing ? 'Edit address' : 'Add address'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12}>
            <TextField
              label="Street"
              fullWidth
              value={draft.street}
              onChange={(e) => updateDraft({ street: e.target.value })}
              error={Boolean(errors.street)}
              helperText={errors.street}
              disabled={saving}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="City"
              fullWidth
              value={draft.city}
              onChange={(e) => updateDraft({ city: e.target.value })}
              error={Boolean(errors.city)}
              helperText={errors.city}
              disabled={saving}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="State / Region"
              fullWidth
              value={draft.state}
              onChange={(e) => updateDraft({ state: e.target.value })}
              error={Boolean(errors.state)}
              helperText={errors.state}
              disabled={saving}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="ZIP / Postal code"
              fullWidth
              value={draft.zip}
              onChange={(e) => updateDraft({ zip: e.target.value })}
              error={Boolean(errors.zip)}
              helperText={errors.zip}
              disabled={saving}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Country"
              fullWidth
              value={draft.country}
              onChange={(e) => updateDraft({ country: e.target.value })}
              error={Boolean(errors.country)}
              helperText={errors.country}
              disabled={saving}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving}>
          {saving ? 'Saving…' : editing ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
