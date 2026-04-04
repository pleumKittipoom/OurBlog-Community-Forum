// src/components/DashboardPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
const API_URL = 'http://localhost:3003/note';

export const DashboardPage = ({ token, onLogout }) => {
    const [notes, setNotes] = useState([]);
    const [message, setMessage] = useState('');

    // State สำหรับฟอร์ม "สร้าง"
    const [createTitle, setCreateTitle] = useState('');
    const [createContent, setCreateContent] = useState('');
    const [createImageUrl, setCreateImageUrl] = useState('');

    // State สำหรับฟอร์ม "แก้ไข"
    const [editingId, setEditingId] = useState(null); // ID ของโน้ตที่กำลังแก้
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editImageUrl, setEditImageUrl] = useState('');

    // State สำหรับ Filter/Sort
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt' | 'updatedAt'
    const [sortOrder, setSortOrder] = useState('DESC');

    // ฟังก์ชัน fetchWithAuth และ fetchNotes
    const fetchWithAuth = (endpoint, options = {}) => {
        const headers = {
            ...options.headers,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
        return fetch(`${API_URL}${endpoint}`, { ...options, headers });
    };

    const fetchNotes = async () => {
        try {
            const response = await fetchWithAuth('');
            if (!response.ok) throw new Error('Failed to fetch notes');
            const data = await response.json();
            setNotes(data);
        } catch (error) {
            setMessage(error.message);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    // 3. อัปเดตฟังก์ชันสร้างโน้ต
    const handleCreateNote = async (e) => {
        e.preventDefault();
        try {
            const response = await fetchWithAuth('', {
                method: 'POST',
                // 4. ส่ง title และ content จาก State
                body: JSON.stringify({ title: createTitle, content: createContent, imageUrl: createImageUrl, }),
            });
            if (!response.ok) throw new Error('Failed to create note');

            setCreateTitle(''); 
            setCreateContent(''); 
            setCreateImageUrl('');
            fetchNotes(); // โหลดรายการใหม่
        } catch (error) {
            setMessage(error.message);
        }
    };

    // ฟังก์ชัน handleDeleteNote
    const handleDeleteNote = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const response = await fetchWithAuth(`/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete note');
            fetchNotes();
        } catch (error) {
            setMessage(error.message);
        }
    };

    // 5. เมื่อคลิกปุ่ม "Edit"
    const handleEditClick = (note) => {
        setEditingId(note.id);
        setEditTitle(note.title);
        setEditContent(note.content || '');
        setEditImageUrl(note.imageUrl || '');
    };

    // 6. เมื่อคลิกปุ่ม "Cancel"
    const handleCancelClick = () => {
        setEditingId(null);
    };

    // 7. เมื่อคลิกปุ่ม "Save"
    const handleSaveClick = async () => {
        if (!editingId) return;

        try {
            const response = await fetchWithAuth(`/${editingId}`, { // PATCH /note/:id
                method: 'PATCH',
                body: JSON.stringify({ title: editTitle, content: editContent, imageUrl: editImageUrl, }),
            });

            if (!response.ok) throw new Error('Failed to save note');

            setEditingId(null); // ปิดโหมดแก้ไข
            fetchNotes();     // โหลดข้อมูลใหม่
        } catch (error) {
            setMessage(error.message);
        }
    };

    // Logic สำหรับ Filter และ Sort (ใช้ useMemo เพื่อประสิทธิภาพ)
    const filteredAndSortedNotes = useMemo(() => {
        let result = [...notes];

        // 1.1. Filter: ค้นหาตามชื่อ (ไม่คำนึงถึงขนาดตัวอักษร)
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            result = result.filter(note =>
                note.title.toLowerCase().includes(lowerCaseSearch)
            );
        }

        // 1.2. Sort: จัดเรียง
        result.sort((a, b) => {
            const dateA = new Date(a[sortBy]).getTime();
            const dateB = new Date(b[sortBy]).getTime();

            if (sortOrder === 'ASC') {
                return dateA - dateB;
            } else { // DESC (ใหม่สุดอยู่บน)
                return dateB - dateA;
            }
        });

        return result;
    }, [notes, searchTerm, sortBy, sortOrder]);


    // Helper Function: สำหรับแสดงวันที่ (ใช้บ่อยจึงแยกออกมา)
    const formatNoteDate = (note) => {
        const createdAtDate = new Date(note.createdAt);
        const updatedAtDate = new Date(note.updatedAt);
        // เช็คว่าเวลา update ต่างจากเวลา create เกิน 1 วินาทีหรือไม่
        const isEdited = (updatedAtDate.getTime() - createdAtDate.getTime()) > 1000;

        const displayDate = isEdited ? updatedAtDate : createdAtDate;

        const formattedDate = new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(displayDate);

        return `${formattedDate} ${isEdited ? ' (แก้ไข)' : ''}`;
    };




    return (
        <div style={styles.container}>
            {/* <h2>My Notes</h2>
            <button onClick={onLogout} style={styles.logoutButton}>Logout</button> */}

            {/* --- ฟอร์มสร้างโน้ต --- */}
            <form onSubmit={handleCreateNote} style={styles.form}>
                <h3>Create New Note</h3>
                <input
                    type="text"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="New note title"
                    required
                    style={styles.input}
                />
                <textarea
                    value={createContent}
                    onChange={(e) => setCreateContent(e.target.value)}
                    placeholder="Note content..."
                    style={styles.textarea}
                />
                <input
                    type="url" // ใช้ type="url" เพื่อการตรวจสอบเบื้องต้น
                    value={createImageUrl}
                    onChange={(e) => setCreateImageUrl(e.target.value)}
                    placeholder="Image URL (optional)"
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Add Note</button>
            </form>

            {message && <p style={styles.message}>{message}</p>}

            {/* --- เส้นคั่น --- */}
            <hr style={styles.hr} />

            {/* แถบควบคุม Search/Filter/Sort */}
            <div style={styles.controlsBar}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search my notes by title..."
                    style={styles.searchInput}
                />
                <div style={styles.sortGroup}>
                    <label style={styles.sortLabel}>Sort:</label>
                    <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                            const [newSortBy, newSortOrder] = e.target.value.split('-');
                            setSortBy(newSortBy);
                            setSortOrder(newSortOrder);
                        }}
                        style={styles.selectInput}
                    >
                        <option value="createdAt-DESC">Newest First</option>
                        <option value="createdAt-ASC">Oldest First</option>
                        <option value="updatedAt-DESC">Recently Edited</option>
                    </select>
                </div>
            </div>

            {/* --- รายการโน้ต --- */}
            <ul style={styles.noteList}>
                {filteredAndSortedNotes.length === 0 && (
                    <p>{searchTerm ? 'No notes match your search.' : 'No notes found.'}</p>
                )}

                {filteredAndSortedNotes.map((note) => (
                    <li key={note.id} style={styles.noteItem}>

                        {/* --- Render Logic --- */}
                        {editingId === note.id ? (
                            /* --- 1. โหมดแก้ไข (Editing Mode) --- */
                            <div style={styles.editForm}>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    style={styles.input}
                                />
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    style={styles.textarea}
                                />
                                <input
                                    type="url"
                                    value={editImageUrl}
                                    onChange={(e) => setEditImageUrl(e.target.value)}
                                    placeholder="Image URL (optional)"
                                    style={styles.input}
                                />
                                <div style={styles.buttonGroup}>
                                    <button onClick={handleSaveClick} style={styles.saveButton}>Save</button>
                                    <button onClick={handleCancelClick} style={styles.cancelButton}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            /* --- 2. โหมดแสดงผล (Display Mode) --- */
                            <div style={styles.displayMode}>
                                {/* ส่วนเนื้อหาหลัก */}
                                <div style={styles.noteContent}>
                                    {/* 1. Title (สีทอง) */}
                                    <strong style={styles.noteTitle}>{note.title}</strong>
                                    {/* Image */}
                                    {note.imageUrl && (
                                        <img src={note.imageUrl} alt={note.title} style={styles.dashboardImage} />
                                    )}
                                    {/* Content */}
                                    <p style={styles.noteContentText}>{note.content}</p>
                                </div>

                                {/* เส้นคั่น */}
                                <hr style={styles.noteHr} />

                                {/* ส่วน Footer (วันที่และปุ่ม) */}
                                <div style={styles.noteFooter}>
                                    {/* 2. วันที่ */}
                                    <small style={styles.noteDate}>{formatNoteDate(note)}</small>
                                    {/* 3. ปุ่ม Edit/Delete */}
                                    <div style={styles.buttonGroup}>
                                        <button onClick={() => handleEditClick(note)} style={styles.editButton}>
                                            Edit
                                        </button>
                                        <button onClick={() => handleDeleteNote(note.id)} style={styles.deleteButton}>
                                            X
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* --- จบ Render Logic --- */}

                    </li>
                ))}
            </ul>
        </div>
    );
};


const styles = {
    container: {
        width: '500px',
        padding: '30px',
        backgroundColor: '#444',
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
        fontFamily: 'Arial, sans-serif',
        color: '#e0e0e0',
    },
    logoutButton: {
        padding: '8px 15px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.9em',
        float: 'right',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '20px',
        textAlign: 'left',
    },
    input: {
        flexGrow: 1, padding: '10px', borderRadius: '5px',
        border: '1px solid #666', backgroundColor: '#555',
        color: '#e0e0e0', fontSize: '1em',
    },
    textarea: {
        padding: '10px', borderRadius: '5px', border: '1px solid #666',
        backgroundColor: '#555', color: '#e0e0e0', fontSize: '1em',
        fontFamily: 'Arial, sans-serif', resize: 'vertical', minHeight: '80px',
    },

    controlsBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        gap: '10px', // เพิ่มระยะห่างระหว่าง Search กับ Sort
        flexWrap: 'wrap',
    },
    searchInput: {
        flexGrow: 1,
        padding: '8px 10px',
        borderRadius: '5px',
        border: '1px solid #666',
        backgroundColor: '#555',
        color: '#e0e0e0',
        fontSize: '0.9em',
        minWidth: '200px',
    },
    sortGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0,
    },
    sortLabel: {
        fontSize: '0.9em',
        color: '#bbb',
    },
    selectInput: {
        padding: '8px 10px',
        borderRadius: '5px',
        border: '1px solid #666',
        backgroundColor: '#555',
        color: '#e0e0e0',
        fontSize: '0.9em',
        cursor: 'pointer',
    },

    button: { // (ปุ่ม Add Note)
        padding: '10px 15px', backgroundColor: '#28a745', color: 'white',
        border: 'none', borderRadius: '5px', cursor: 'pointer',
        fontSize: '1em', fontWeight: 'bold',
    },
    message: {
        marginTop: '15px', color: '#ff6b6b', wordBreak: 'break-all',
        textAlign: 'left',
    },
    hr: {
        border: 'none',
        borderTop: '1px solid #666',
        margin: '20px 0',
    },
    noteList: {
        listStyle: 'none', padding: 0, marginTop: '20px',
    },
    noteItem: {
        backgroundColor: '#555',
        padding: '15px',
        marginBottom: '10px',
        borderRadius: '5px',
        position: 'relative',
        textAlign: 'left',
    },
    noteTitle: {
        fontSize: '1.2em',
        fontWeight: 'bold',
        color: '#FFD700', // สีทอง
        display: 'block',
        marginBottom: '10px',
    },
    // --- สไตล์ใหม่สำหรับ Edit/Display ---
    displayMode: {
        display: 'flex',
        flexDirection: 'column', // จัดเรียงองค์ประกอบในแนวตั้ง
        textAlign: 'left',
    },
    buttonGroupAbsolute: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        display: 'flex',
        gap: '8px',
        zIndex: 10, // ตรวจสอบให้แน่ใจว่าปุ่มอยู่เหนือเนื้อหา
    },
    titleAndDate: { 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '5px',
    },
    noteDate: { 
        color: '#aaa',
        fontSize: '0.85em',
        fontStyle: 'italic',
    },
    noteContent: {
        flexGrow: 1,
    },
    noteContentText: {
        whiteSpace: 'pre-wrap',
        margin: '5px 0 0 0', // ลบ Margin ด้านบนและล่างเริ่มต้นของ p ออก
        paddingBottom: '10px',
    },
    dashboardImage: {
        maxWidth: '100%',
        maxHeight: '150px', // จำกัดความสูง
        width: 'auto',
        height: 'auto',
        borderRadius: '3px',
        margin: '10px 0',
        display: 'block',
        objectFit: 'cover', // ทำให้รูปภาพครอบคลุมพื้นที่
    },

    noteHr: {
        border: 'none',
        borderTop: '1px solid #666',
        margin: '5px 0 10px 0', // ระยะห่างสั้นลง
        width: '100%',
    },

    noteFooter: {
        display: 'flex',
        justifyContent: 'space-between', // ผลักวันที่ไปซ้าย ปุ่มไปขวา
        alignItems: 'center',
        marginTop: '5px',
    },

    noteDate: {
        color: '#aaa',
        fontSize: '0.85em',
        fontStyle: 'italic',
    },

    buttonGroup: {
        display: 'flex',
        gap: '8px',
        // flexShrink: 0,
    },
    editButton: {
        padding: '5px 10px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    deleteButton: {
        backgroundColor: '#ff6b6b', color: 'white', border: 'none',
        borderRadius: '5px', width: '30px', height: '30px',
        cursor: 'pointer', fontWeight: 'bold',
    },
    // --- สไตล์ใหม่สำหรับฟอร์มแก้ไข ---
    editForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    saveButton: {
        padding: '5px 10px',
        backgroundColor: '#28a745', // สีเขียว
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    cancelButton: {
        padding: '5px 10px',
        backgroundColor: '#6c757d', // สีเทา
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    }
};