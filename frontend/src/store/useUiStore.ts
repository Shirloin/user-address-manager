import { create } from 'zustand';
import type {
  Address,
  AddressPayload,
  CreateUserPayload,
} from '../types/domain.ts';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface SnackbarState {
  open: boolean;
  severity: Severity;
  message: string;
}

interface UiState {
  // Address dialog
  addressDialogOpen: boolean;
  editingAddressId: string | null;
  addressDraft: AddressPayload;

  pendingDeleteAddressId: string | null;

  // Create-user dialog
  createUserDialogOpen: boolean;
  newUserDraft: CreateUserPayload;

  snackbar: SnackbarState;

  // address-dialog actions
  openAddAddressDialog: () => void;
  openEditAddressDialog: (address: Address) => void;
  closeAddressDialog: () => void;
  updateAddressDraft: (patch: Partial<AddressPayload>) => void;

  // address-delete confirmation
  requestDeleteAddress: (addressId: string) => void;
  cancelDeleteAddress: () => void;

  // create-user actions
  openCreateUserDialog: () => void;
  closeCreateUserDialog: () => void;
  updateNewUserDraft: (patch: Partial<CreateUserPayload>) => void;

  // snackbar
  showSnackbar: (severity: Severity, message: string) => void;
  closeSnackbar: () => void;
}

const EMPTY_ADDRESS_DRAFT: AddressPayload = {
  street: '',
  city: '',
  state: '',
  zip: '',
  country: '',
};

const EMPTY_USER_DRAFT: CreateUserPayload = {
  firstName: '',
  lastName: '',
  email: '',
};

// UI-only state. NEVER store server data here — that belongs in the TanStack
// Query cache. What lives here: which dialog is open, which address id is being
// edited, transient form drafts, and the snackbar.
export const useUiStore = create<UiState>((set) => ({
  addressDialogOpen: false,
  editingAddressId: null,
  addressDraft: { ...EMPTY_ADDRESS_DRAFT },

  pendingDeleteAddressId: null,

  createUserDialogOpen: false,
  newUserDraft: { ...EMPTY_USER_DRAFT },

  snackbar: { open: false, severity: 'success', message: '' },

  openAddAddressDialog: () =>
    set({
      addressDialogOpen: true,
      editingAddressId: null,
      addressDraft: { ...EMPTY_ADDRESS_DRAFT },
    }),

  openEditAddressDialog: (address) =>
    set({
      addressDialogOpen: true,
      editingAddressId: address.id,
      addressDraft: {
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
      },
    }),

  closeAddressDialog: () =>
    set({
      addressDialogOpen: false,
      editingAddressId: null,
      addressDraft: { ...EMPTY_ADDRESS_DRAFT },
    }),

  updateAddressDraft: (patch) =>
    set((state) => ({ addressDraft: { ...state.addressDraft, ...patch } })),

  requestDeleteAddress: (addressId) =>
    set({ pendingDeleteAddressId: addressId }),

  cancelDeleteAddress: () => set({ pendingDeleteAddressId: null }),

  openCreateUserDialog: () =>
    set({
      createUserDialogOpen: true,
      newUserDraft: { ...EMPTY_USER_DRAFT },
    }),

  closeCreateUserDialog: () =>
    set({
      createUserDialogOpen: false,
      newUserDraft: { ...EMPTY_USER_DRAFT },
    }),

  updateNewUserDraft: (patch) =>
    set((state) => ({ newUserDraft: { ...state.newUserDraft, ...patch } })),

  showSnackbar: (severity, message) =>
    set({ snackbar: { open: true, severity, message } }),

  closeSnackbar: () =>
    set((state) => ({ snackbar: { ...state.snackbar, open: false } })),
}));
