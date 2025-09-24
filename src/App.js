import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'

// Utility function to validate email format
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// API Service
const API_URL = 'https://jsonplaceholder.typicode.com/users';

const fetchUsers = () => axios.get(API_URL);
const addUser = (user) => axios.post(API_URL, user);
const updateUser = (id, user) => axios.put(`${API_URL}/${id}`, user);
const deleteUser = (id) => axios.delete(`${API_URL}/${id}`);

function UserManagement() {

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', department: '' });
  const [editingUserId, setEditingUserId] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ firstName: '', lastName: '', email: '', department: '' });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    loadUsers();
  }, []);

  // Load users from API
  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchUsers();
      // Map data to include department as mock data (JSONPlaceholder does not provide this)
      const usersWithDept = response.data.map(user => ({
        ...user,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ')[1] || '',
        department: 'General' // default as JSONPlaceholder doesn't have department
      }));
      setUsers(usersWithDept);
      setFilteredUsers(usersWithDept);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  // Filter, search, sort and paginate users for display
  useEffect(() => {
    let filtered = [...users];

    // Apply search
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(lowerSearch) ||
        user.lastName.toLowerCase().includes(lowerSearch) ||
        user.email.toLowerCase().includes(lowerSearch) ||
        user.department.toLowerCase().includes(lowerSearch)
      );
    }

    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        filtered = filtered.filter(user =>
          user[key].toLowerCase().includes(filters[key].toLowerCase())
        );
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aKey = a[sortConfig.key].toLowerCase();
        const bKey = b[sortConfig.key].toLowerCase();
        if (aKey < bKey) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aKey > bKey) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // reset page on filter/sort change
  }, [users, searchText, filters, sortConfig]);

  // Pagination (calculate current page users)
  const pageCount = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Client-side validation
  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.department) {
      setError('All fields are required.');
      return false;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email.');
      return false;
    }
    setError('');
    return true;
  };

  // Add or Update user submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingUserId === null) {
        const response = await addUser(formData);
        const newUser = {
          id: response.data.id || users.length + 1,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          department: formData.department
        };
        setUsers(prev => [...prev, newUser]);
      } else {
        await updateUser(editingUserId, formData);
        setUsers(prev =>
          prev.map(u => (u.id === editingUserId ? { ...u, ...formData } : u))
        );
        setEditingUserId(null);
      }
      setFormData({ firstName: '', lastName: '', email: '', department: '' });
    } catch {
      setError('Failed to save user.');
    }
  };

  // Edit button handler
  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      department: user.department
    });
    setError('');
  };

  // Delete user handler
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        setUsers(prev => prev.filter(user => user.id !== id));
      } catch {
        setError('Failed to delete user.');
      }
    }
  };

  // Sort handler
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className='app-container' >
      <div className="user-management">
        <h1>User Management Dashboard</h1>

        {/* Search and Filter */}
        <div className="controls">
          <input
            className='search-input-box'
            type="text"
            placeholder="Search users..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <button className='clear-filters-btn' onClick={() => setFilters({ firstName: '', lastName: '', email: '', department: '' })}>
            Clear Filters
          </button>
          {/* Filters can be more advanced popups/dropdowns */}
        </div>

        {/* Display error messages */}
        {error && <div className="error">{error}</div>}

        {/* User Form */}
        <form onSubmit={handleSubmit} className="user-form">
          <h2>{editingUserId ? 'Edit User' : 'Add User'}</h2>
          <input
            className='add-user-form-input'
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
          <input
            className='add-user-form-input'
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
          <input
            className='add-user-form-input'
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            type="email"
          />
          <input
            className='add-user-form-input'
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleInputChange}
            required
          />
          <button type="submit">{editingUserId ? 'Update' : 'Add'}</button>
          {editingUserId && (
            <button type="button" onClick={() => { setEditingUserId(null); setFormData({ firstName: '', lastName: '', email: '', department: '' }); setError(''); }}>
              Cancel
            </button>
          )}
        </form>

        {/* User Table */}
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th onClick={() => handleSort('firstName')}>First Name</th>
                <th onClick={() => handleSort('lastName')}>Last Name</th>
                <th onClick={() => handleSort('email')}>Email</th>
                <th onClick={() => handleSort('department')}>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 && (
                <tr><td colSpan="6">No users found.</td></tr>
              )}
              {paginatedUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.department}</td>
                  <td>
                    <button className='edit-btn' onClick={() => handleEdit(user)}>Edit</button>
                    <button className='delete-btn' onClick={() => handleDelete(user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Controls */}
        <div className="pagination">
          <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
            {[10, 25, 50, 100].map(size => (
              <option key={size} value={size}>{size} per page</option>
            ))}
          </select>
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Prev</button>
          <span>Page {currentPage} of {pageCount}</span>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, pageCount))} disabled={currentPage === pageCount}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
