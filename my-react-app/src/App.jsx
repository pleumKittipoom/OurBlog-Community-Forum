import React, { useState, useEffect } from 'react';
// 1. Import React Router
import { Routes, Route, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom';

// 2. Import Pages (จากโฟลเดอร์ components)
import { AuthPage } from './components/AuthPage';
import { DashboardPage } from './components/DashboardPage';
import { PublicNotesPage } from './components/PublicNotesPage';
import { AdminPage } from './components/AdminPage';
import { NoteDetailPage } from './components/NoteDetailPage';

import './App.css';

const UserRole = { USER: 'user', ADMIN: 'admin' };

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // 3. เรียกใช้ useNavigate

  const location = useLocation();
  const [navSearchTerm, setNavSearchTerm] = useState('');

  const handleNavSearch = (e) => {
    e.preventDefault(); // กันหน้าเว็บ Refresh
    // สั่งให้เปลี่ยน URL โดยเพิ่ม ?search=... เข้าไป
    // เราจะคง query params อื่นๆ ไว้ (เช่น page, sortBy) ถ้ามี
    // แต่ถ้าเป็นการค้นหาใหม่, PublicNotesPage ควรจะกลับไปหน้า 1
    // (แบบง่าย) บังคับไปหน้า public พร้อมคำค้นหา
    navigate(`/public?search=${navSearchTerm}`);
  };

  // 5. ฟังก์ชันสำหรับ Logout
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    // (เมื่อ Logout ให้เด้งไปหน้า Login)
    navigate('/login');
  };

  // 4. ฟังก์ชันถอดรหัส Token
  const decodeToken = (token) => {
    try {
      // atob() คือตัวถอดรหัส Base64
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ email: payload.email, id: payload.sub, role: payload.role });
    } catch (e) {
      console.error('Failed to decode token:', e);
      handleLogout(); // ถ้า Token เพี้ยน ให้ Logout
    }
  };

  // useEffect
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      decodeToken(storedToken);
    }
  }, []); // (useEffect นี้ควรมี dependency array ว่างเปล่า)

  // 6. ฟังก์ชัน Login (ที่บังคับเปลี่ยนหน้า)
  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    decodeToken(newToken);
    navigate('/public');
  };


  // 8. ส่วนกำหนดเส้นทาง (Router)
  return (
    <div className="App">
      {token && user && (
        /* --- ถ้า Login แล้ว --- */
        <nav style={styles.nav}>
          <NavLink to="/my-notes" className="nav-link">My Notes</NavLink>
          <NavLink to="/public" className="nav-link">Public Notes</NavLink>

          {user.role === UserRole.ADMIN && (
            <NavLink to="/admin" className="nav-link">Admin Panel</NavLink>
          )}

          {location.pathname === '/public' && (
            <form onSubmit={handleNavSearch} style={styles.navSearchForm}>
              <input
                type="text"
                placeholder="Search public notes..."
                style={styles.navSearchInput}
                value={navSearchTerm}
                onChange={(e) => setNavSearchTerm(e.target.value)}
              />
              <button type="submit" className="nav-search-button">Search</button>
            </form>
          )}

          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </nav>
      )}

      {/* --- ส่วนแสดงผลหน้า --- */}
      <div style={styles.pageContainer}>
        <Routes>
          {!token || !user ? (
            /* --- ถ้ายังไม่ Login --- */
            <>
              <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />
              {/* ถ้าเข้าหน้าอื่น ให้เด้งไป Login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            /* --- ถ้า Login แล้ว --- */
            <>
              <Route path="/my-notes" element={<DashboardPage token={token} user={user} />} />
              <Route path="/public" element={<PublicNotesPage token={token} user={user} />} />
              <Route path="/note/:id" element={<NoteDetailPage token={token} user={user} />} />

              {user.role === UserRole.ADMIN && (
                <Route path="/admin" element={<AdminPage token={token} user={user} />} />
              )}

              {/* (หน้าแรก ให้เด้งไป /public) */}
              <Route path="*" element={<Navigate to="/public" replace />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}

// (CSS สำหรับ Nav Bar)
const styles = {
  nav: {
    width: '100%',
    padding: '15px 0',
    backgroundColor: '#444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    position: 'fixed', 
    top: 0,
    left: 0,
    boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
    zIndex: 100,
  },
  navLink: {
    padding: '8px 12px',
    textDecoration: 'none',
    color: '#e0e0e0',
    borderRadius: '5px',
  },
  navSearchForm: {
    display: 'flex',
    marginLeft: '20px', // (เว้นระยะห่างจาก Link)
  },
  navSearchInput: {
    padding: '6px 10px',
    border: '1px solid #777',
    borderRadius: '4px 0 0 4px',
    backgroundColor: '#555',
    color: 'white',
    borderRight: 'none',
  },
  navSearchButton: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '0 4px 4px 0',
    backgroundColor: '#FFD700',
    color: 'black',
    cursor: 'pointer',
  },
  logoutButton: {
    position: 'absolute',
    right: '20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  pageContainer: {
    marginTop: '80px', 
    width: '100%',
    display: 'flex',
    justifyContent: 'center', 
    alignItems: 'flex-start', 
    padding: '2rem 0',
  }
};

export default App;