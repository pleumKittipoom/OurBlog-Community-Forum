import React, { useState } from 'react';
const API_URL = 'http://localhost:3003/auth';

// รับ onLogin ที่เป็นฟังก์ชันมาจาก App.jsx
export const AuthPage = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const endpoint = isRegister ? '/register' : '/login';
    const payload = { email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Something went wrong');

      if (isRegister) {
        setMessage('Registration successful! Please log in.');
        setIsRegister(false);
      } else {
        onLogin(data.access_token);
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  // --- ส่วน JSX ที่ถูกต้อง ---
  return (
    <div style={styles.container}>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>

      {/* ปุ่มสลับหน้า */}
      <button
        onClick={() => {
          setIsRegister(!isRegister);
          setMessage('');
        }}
        style={styles.toggleButton}
      >
        {isRegister
          ? 'Already have an account? Login'
          : "Don't have an account? Register"}
      </button>
      
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};


const styles = {
  container: {
    width: '350px', /* เพิ่มความกว้างขึ้นเล็กน้อย */
    padding: '30px', /* เพิ่ม padding */
    backgroundColor: '#444', /* พื้นหลังกล่อง Login/Register */
    borderRadius: '10px', /* ขอบโค้งมน */
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)', /* เพิ่มเงา */
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    color: '#e0e0e0', /* สีตัวอักษรในกล่อง */
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px', /* เพิ่มระยะห่างด้านบน */
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  label: { /* เพิ่ม Style ให้ Label */
    marginBottom: '5px',
    fontSize: '0.9em',
    color: '#bbbbbb',
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #666', /* สีขอบ Input */
    backgroundColor: '#555', /* สีพื้นหลัง Input */
    color: '#e0e0e0', /* สีตัวอักษรใน Input */
    fontSize: '1em',
  },
  button: {
    padding: '12px', /* เพิ่มขนาดปุ่ม */
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease', /* เพิ่ม Effect */
  },
  buttonHover: { /* เพิ่ม Hover effect (ต้องใช้ useState มาควบคุม หรือใช้ CSS Module) */
    backgroundColor: '#0056b3',
  },
  toggleButton: {
    marginTop: '20px', /* เพิ่มระยะห่าง */
    backgroundColor: 'transparent',
    border: 'none',
    color: '#88aaff', /* สีลิงก์สวยขึ้น */
    cursor: 'pointer',
    textDecoration: 'none', /* ลบขีดเส้นใต้ */
    fontSize: '00.9em',
  },
  message: {
    marginTop: '15px',
    color: '#ff6b6b', /* สีแดงสำหรับ Error */
    wordBreak: 'break-all',
  },
  h2: {
    marginBottom: '20px',
    color: '#e0e0e0',
  }
};
