import React, { useState, useEffect } from 'react';
const API_URL = 'http://localhost:3003/admin';

const UserRole = { USER: 'user', ADMIN: 'admin' };

export const AdminPage = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  const fetchWithAuth = (endpoint, options = {}) => {
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    return fetch(endpoint, { ...options, headers });
  };

  // 1. โหลด User ทั้งหมด
  const fetchUsers = async () => {
    try {
      setMessage('');
      const response = await fetchWithAuth(`${API_URL}/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.map(u => ({ id: u.id, email: u.email, role: u.role })));
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // 2. ฟังก์ชันเปลี่ยน Role
  const handleRoleChange = async (id, newRole) => {
    if (!window.confirm(`Are you sure you want to make this user ${newRole}?`)) return;
    try {
      setMessage('');
      const response = await fetchWithAuth(`${API_URL}/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) throw new Error('Failed to update role');
      fetchUsers(); // โหลดซ้ำ
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div style={styles.container}>
      {message && <p style={styles.message}>{message}</p>}
      <table style={styles.table}>
        <thead>
          <tr style={styles.tr}>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={styles.tr}>
              <td style={styles.td}>{user.email}</td>
              <td style={styles.td}>{user.role}</td>
              <td style={styles.td}>
                {user.role === UserRole.USER ? (
                  <button style={styles.adminButton} onClick={() => handleRoleChange(user.id, UserRole.ADMIN)}>
                    Make Admin
                  </button>
                ) : (
                  <button style={styles.userButton} onClick={() => handleRoleChange(user.id, UserRole.USER)}>
                    Make User
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 3. CSS
const styles = {
  container: { width: '600px', },
  message: { color: 'red' },
  table: {
    width: '100%',
    marginTop: '20px',
    borderCollapse: 'collapse',
  },
  tr: { borderBottom: '1px solid #666' },
  th: { padding: '10px', textAlign: 'left', backgroundColor: '#555' },
  td: { padding: '10px', textAlign: 'left' },
  adminButton: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' },
  userButton: { backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' },
};