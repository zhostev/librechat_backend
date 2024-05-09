import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)({
  marginTop: 16,
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: '0px 3px 5px rgba(0,0,0,0.2)'
});

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'USER', // Default role
    avatar: '',
    provider: 'local', // Default provider
    plugins: []
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/users');
      setUsers(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users", error);
      setSnackbarMessage('Failed to fetch users');
      setOpenSnackbar(true);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/users/${userId}`);
      fetchUsers(); // Refresh the list after deletion
      setSnackbarMessage('User deleted successfully');
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewUser({ name: '', username: '', email: '', password: '', role: 'USER', avatar: '', provider: 'local', plugins: [] });
  };

  const handleAddUser = async () => {
    try {
      await axios.post('http://localhost:5000/users', newUser);
      fetchUsers(); // Refresh list after adding
      setOpenDialog(false);
      setSnackbarMessage('User added successfully');
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Failed to add user", error);
      setSnackbarMessage('Failed to add user');
      setOpenSnackbar(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container component={StyledPaper}>
      <Typography variant="h4" gutterBottom>
        Users Management
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpenDialog}>Add New User</Button>
      {isLoading ? <CircularProgress /> :
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Button variant="contained" color="secondary" onClick={() => deleteUser(user._id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">No users found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      }
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)} message={snackbarMessage} />
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <DialogContentText>Please enter the user details below:</DialogContentText>
          <TextField autoFocus margin="dense" id="name" label="Name" name="name" type="text" fullWidth variant="standard" value={newUser.name} onChange={handleChange} />
          <TextField margin="dense" id="username" label="Username" name="username" type="text" fullWidth variant="standard" value={newUser.username} onChange={handleChange} />
          <TextField margin="dense" id="email" label="Email" name="email" type="email" fullWidth variant="standard" value={newUser.email} onChange={handleChange} />
          <TextField margin="dense" id="password" label="Password" name="password" type="password" fullWidth variant="standard" value={newUser.password} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddUser}>Add User</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users;