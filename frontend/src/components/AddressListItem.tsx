import { IconButton, ListItem, ListItemText, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { Address } from '../types/domain.ts';

interface AddressListItemProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
}

export default function AddressListItem({
  address,
  onEdit,
  onDelete,
}: AddressListItemProps) {
  return (
    <ListItem
      divider
      secondaryAction={
        <Stack direction="row" spacing={1}>
          <IconButton edge="end" aria-label="edit" onClick={() => onEdit(address)}>
            <EditIcon />
          </IconButton>
          <IconButton edge="end" aria-label="delete" onClick={() => onDelete(address)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      }
    >
      <ListItemText
        primary={`${address.street}, ${address.city}`}
        secondary={`${address.state} ${address.zip}, ${address.country}`}
      />
    </ListItem>
  );
}
