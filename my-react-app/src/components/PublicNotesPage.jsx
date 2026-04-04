// src/components/PublicNotesPage.jsx
import React, { useState, useEffect } from 'react';
import { ReactionModal } from './ReactionModal';
import { Link, useSearchParams } from 'react-router-dom';
const API_URL = 'http://localhost:3003/note';

// 1. สร้าง Object สำหรับ Emoji
const reactionEmojis = {
  like: '👍',
  love: '❤️',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡',
};

const LIMIT = 5;

// 2. รับ prop 'user' ที่ส่งมาจาก App.jsx
export const PublicNotesPage = ({ token, user, }) => {
  const [notes, setNotes] = useState([]);
  const [message, setMessage] = useState('');
  const [modalReactions, setModalReactions] = useState(null);

  const [totalPages, setTotalPages] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();

  // 3. ดึงค่า 'search' และ 'page' ออกจาก URL
  // ถ้าไม่มี, ให้ใช้ค่า default (เช่น '' และ 1)
  const querySearch = searchParams.get('search') || '';
  const queryPage = parseInt(searchParams.get('page') || '1', 10);
  const querySortBy = searchParams.get('sortBy') || 'createdAt';
  const querySortOrder = searchParams.get('sortOrder') || 'DESC';

  const fetchWithAuth = (endpoint, options = {}) => {
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    return fetch(`${API_URL}${endpoint}`, { ...options, headers });
  };

  useEffect(() => {
    const fetchAllNotes = async () => {
      try {
        // 3. สร้าง URL แบบไดนามิก
        const params = new URLSearchParams({
          page: queryPage,             
          limit: LIMIT,
          sortBy: querySortBy,       
          sortOrder: querySortOrder,
          search: querySearch,       
        });

        const response = await fetchWithAuth(`/all?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch public notes');

        const data = await response.json(); 

        // 4. อัปเดต State ใหม่
        setNotes(data.data); 
        setTotalPages(Math.ceil(data.total / LIMIT)); 

      } catch (error) {
        setMessage(error.message);
      }
    };
    fetchAllNotes();
  }, [token, queryPage, querySortBy, querySortOrder, querySearch]);

  // 4. อัปเดตฟังก์ชัน handleReaction
  const handleReaction = async (id, type) => {
    try {
      // 5. เรียก Endpoint ใหม่
      const response = await fetchWithAuth(`/${id}/react`, {
        method: 'POST',
        body: JSON.stringify({ type: type }), 
      });
      if (!response.ok) throw new Error('Failed to set reaction');

      const updatedNote = await response.json(); 

      // 6. อัปเดต State ทันที
      setNotes(notes.map(note =>
        note.id === id ? updatedNote : note
      ));
    } catch (error) {
      setMessage(error.message);
    }
  };

  const updateQueryParams = (newParams) => {
    // อ่านค่า params เก่าทั้งหมด
    const oldParams = {};
    searchParams.forEach((value, key) => {
      oldParams[key] = value;
    });

    // ใส่ค่าใหม่ทับค่าเก่า และสั่งเปลี่ยน URL
    setSearchParams({ ...oldParams, ...newParams });
  };

  // const handleSortChange = (sortBy, sortOrder) => {
  //   setSortConfig({ sortBy, sortOrder });
  //   setPage(1); 
  // };

  // const handleSearchSubmit = (e) => {
  //   e.preventDefault(); // ป้องกันการ reload หน้า
  //   setSearchQuery(searchInput); // อัปเดตคำค้นหาจริง
  //   setPage(1); // กลับไปหน้า 1 เสมอเมื่อค้นหาใหม่
  // };

  return (
    <div style={styles.container}>
      {message && <p style={styles.message}>{message}</p>}

      {/* 7. แถบควบคุม (Sort + Pagination) */}
      <div style={styles.controls}>
        <div style={styles.sortButtons}>
          <strong>Sort by:</strong>
          <button onClick={() => updateQueryParams({ sortBy: 'createdAt', sortOrder: 'DESC', page: 1 })}>
            Newest
          </button>
          <button onClick={() => updateQueryParams({ sortBy: 'createdAt', sortOrder: 'ASC', page: 1 })}>
            Oldest
          </button>
        </div>

        <div style={styles.pagination}>
          <button onClick={() => updateQueryParams({ page: queryPage - 1 })} disabled={queryPage <= 1}>
            Previous
          </button>
          <span>Page {queryPage} of {totalPages || 1}</span>
          <button onClick={() => updateQueryParams({ page: queryPage + 1 })} disabled={queryPage >= totalPages}>
            Next
          </button>
        </div>
      </div>

      <ul style={styles.noteList}>
        {notes.length === 0 && <p>No public notes found.</p>}
        {notes.map((note) => {

          const content = note.content || '';
          const isContentTooLong = content.length > 150;

          const displayContent = isContentTooLong
            ? content.substring(0, 150) + '...' // ถ้าเกิน 150 ตัว ให้ตัดและใส่ ...
            : content; // ถ้าไม่เกิน ให้แสดงทั้งหมด

          // 7. ตรวจสอบว่า "เรา" (user ที่ login) React อันไหน
          const myReaction = note.reactions.find(r => r.user.id === user.id);

          // 8. (สำคัญ) นับและจัดกลุ่ม Reactions
          const reactionCounts = note.reactions.reduce((acc, reaction) => {
            acc[reaction.type] = (acc[reaction.type] || 0) + 1;
            return acc;
          }, {}); // ผลลัพธ์: { like: 5, love: 2 }

          // (จัดลำดับผลลัพธ์)
          const sortedReactions = Object.entries(reactionCounts)
            .sort(([, countA], [, countB]) => countB - countA);

          {/* --- 1. START: เพิ่ม Logic คำนวณวันที่ --- */ }
          {
            (() => { // (ใช้ IIFE เพื่อสร้างตัวแปรใน scope)
              const createdAtDate = new Date(note.createdAt);
              const updatedAtDate = new Date(note.updatedAt);

              // เช็กว่า update ห่างจาก create เกิน 1 วินาทีหรือไม่
              const isEdited = (updatedAtDate.getTime() - createdAtDate.getTime()) > 1000;

              const displayDate = isEdited ? updatedAtDate : createdAtDate;

              // จัดรูปแบบวันที่ (เช่น: 12 พ.ย. 2568, 18:30)
              const formattedDate = new Intl.DateTimeFormat('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(displayDate);

              // ส่งค่า JSX กลับไปให้ map
              return (
                <small style={styles.timestamp}>
                  {formattedDate}
                  {isEdited && <span> (แก้ไข)</span>}
                </small>
              );
            })()
          }

          return (
            // 1. หุ้ม <li> ด้วย <Link>

            <li className="public-note-item" key={note.id}>

              <Link to={`/note/${note.id}`} className="note-title-link">
                {note.title}
              </Link>
              {/* (ตัดข้อความให้สั้นลง) */}
              <p style={styles.noteContentSnippet}>{displayContent || '(No content)'}</p>

              <div style={styles.metaInfo}>
                <small style={styles.author}>By: {note.user?.email || 'Unknown'}</small>
                {(() => {
                  const createdAtDate = new Date(note.createdAt);
                  const updatedAtDate = new Date(note.updatedAt);
                  const isEdited = (updatedAtDate.getTime() - createdAtDate.getTime()) > 1000;
                  const displayDate = isEdited ? updatedAtDate : createdAtDate;
                  const formattedDate = new Intl.DateTimeFormat('th-TH', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  }).format(displayDate);

                  return (
                    <small style={styles.timestamp}>
                      {formattedDate}
                      {isEdited && <span> (แก้ไข)</span>}
                    </small>
                  );
                })()}
              </div>
              {/* --- ส่วนที่คลิก "ไม่ได้" (ต้องหยุด Event) --- */}
              <div style={styles.reactionBar}>
                {Object.keys(reactionEmojis).map(type => (
                  <button
                    key={type}
                    onClick={(e) => {
                      // e.preventDefault();
                      e.stopPropagation();
                      handleReaction(note.id, type);
                    }}
                    className={
                      myReaction?.type === type
                        ? "reaction-button reaction-button-active" 
                        : "reaction-button" 
                    }
                  >
                    {reactionEmojis[type]}
                  </button>
                ))}
              </div>

              {sortedReactions.length > 0 && (
                <div
                  className="reaction-counts"
                  onClick={(e) => {
                    // e.preventDefault();
                    e.stopPropagation();
                    setModalReactions(note.reactions);
                  }}
                >
                  {sortedReactions.map(([type, count]) => (
                    <span key={type} style={styles.reactionCount}>
                      {reactionEmojis[type]} {count}
                    </span>
                  ))}
                </div>
              )}
            </li>

          );
        })}
      </ul>

      {/* Render Modal (เมื่อ modalReactions ไม่ใช่ null) */}
      {modalReactions && (
        <ReactionModal
          reactions={modalReactions}
          onClose={() => setModalReactions(null)}
        />
      )}
    </div>
  );
};


const styles = {
  container: {
    width: '600px',
    padding: '0',
  },
  message: { color: 'red' },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  sortButtons: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
  },
  pagination: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },

  noteList: { listStyle: 'none', padding: 0, marginTop: '20px' },
  noteContentSnippet: {
    whiteSpace: 'pre-wrap', // เก็บการขึ้นบรรทัดไว้
    wordBreak: 'break-word', // ป้องกันข้อความยาวเกินไป
    color: '#e0e0e0',
  },

  timestamp: {
    color: '#999', // สีเทาจางๆ
    fontSize: '0.9em',
  },

  metaInfo: {
    display: 'flex',                 // ใช้ Flexbox
    justifyContent: 'space-between', // จัดให้ชิดซ้าย-ขวา
    alignItems: 'center',            // จัดให้อยู่กึ่งกลางในแนวตั้ง
    marginTop: '15px',               // เว้นระยะจาก content ด้านบน
    marginBottom: '10px',            // เว้นระยะจาก reaction bar ด้านล่าง
  },

  author: {
    color: '#bbb',
    // marginTop: '5px',
    display: 'block',
    fontStyle: 'italic',
  },
  // --- สไตล์ใหม่สำหรับแถบ Reaction ---
  reactionBar: {
    display: 'flex',
    gap: '5px',
    borderTop: '1px solid #666',
    paddingTop: '10px',
    marginTop: '15px',
  },
  // --- สไตล์ใหม่สำหรับผลรวม ---
  reactionCounts: {
    position: 'absolute',
    bottom: '10px',
    right: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#444',
    padding: '2px 5px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  reactionCount: {
    fontSize: '0.9em',
  }
};