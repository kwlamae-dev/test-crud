import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import AppSnackbar from '../components/AppSnackbar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import UserFormDialog from '../components/users/UserFormDialog.jsx';
import useSnackbar from '../hooks/useSnackbar.js';
import { userApi } from '../api/index.js';

const AVATAR_COLORS = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#db2777', '#7c3aed'];

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function UsersPage() {
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setLoadError('');
    try {
      setUsers(await userApi.list());
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (user) =>
        user.uname.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term),
    );
  }, [users, search]);

  const openCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleSaved = (saved, isEdit) => {
    setUsers((current) =>
      isEdit
        ? current.map((item) => (item.uid === saved.uid ? saved : item))
        : [...current, saved],
    );
    setFormOpen(false);
    showSnackbar(isEdit ? 'User updated successfully' : 'User added successfully');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await userApi.remove(deleteTarget.uid);
      setUsers((current) => current.filter((item) => item.uid !== deleteTarget.uid));
      setDeleteTarget(null);
      showSnackbar('User deleted successfully');
    } catch (error) {
      showSnackbar(error.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Manage customer accounts. Passwords are hashed before they are stored."
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
            Add user
          </Button>
        }
      />

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            p: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <TextField
            placeholder="Search by name or email…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
            sx={{ maxWidth: { sm: 340 }, width: '100%' }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {filteredUsers.length} of {users.length} users
          </Typography>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 9 }}>
            <CircularProgress />
          </Box>
        ) : loadError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={loadUsers}>
                Retry
              </Button>
            }
            sx={{ m: 2.5 }}
          >
            {loadError}
          </Alert>
        ) : users.length === 0 ? (
          <EmptyState
            icon={<PeopleRoundedIcon />}
            title="No users yet"
            description="Add a customer account before creating orders."
            action={
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
                Add user
              </Button>
            }
          />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={<SearchRoundedIcon />}
            title="No matching users"
            description="Try a different name or email."
          />
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 680 }}>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Password</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.uid} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            width: 38,
                            height: 38,
                            fontSize: 14,
                            fontWeight: 700,
                            bgcolor: AVATAR_COLORS[user.uid % AVATAR_COLORS.length],
                          }}
                        >
                          {initials(user.uname)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600 }}>{user.uname}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            UID #{user.uid}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        icon={<LockRoundedIcon />}
                        label="Hashed"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit user">
                        <IconButton
                          aria-label={`Edit ${user.uname}`}
                          onClick={() => openEdit(user)}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete user">
                        <IconButton
                          aria-label={`Delete ${user.uname}`}
                          color="error"
                          onClick={() => setDeleteTarget(user)}
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <UserFormDialog
        open={formOpen}
        user={editingUser}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user?"
        message={
          deleteTarget
            ? `${deleteTarget.uname} will be permanently deleted. All orders placed by this user will also be deleted.`
            : ''
        }
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <AppSnackbar snackbar={snackbar} onClose={closeSnackbar} />
    </>
  );
}
