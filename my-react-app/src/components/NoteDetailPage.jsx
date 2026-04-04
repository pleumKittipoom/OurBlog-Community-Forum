// src/components/NoteDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ReactionModal } from './ReactionModal';
import { CommentItem } from './CommentItem';

// (API URL แยกกัน)
const NOTE_API_URL = 'http://localhost:3003/note';
const COMMENT_API_URL = 'http://localhost:3003/comment';
const COMMENT_REACTION_API_BASE_URL = 'http://localhost:3003/comment';


// (ใช้ Object นี้อีกครั้ง)
const reactionEmojis = {
    like: '👍', love: '❤️', haha: '😂',
    wow: '😮', sad: '😢', angry: '😡',
};

// Helper Function: สำหรับเพิ่ม Reply เข้าไปใน State (Tree)
const addReplyToTree = (nodes, newReply) => {
    return nodes.map(node => {
        // 1. ถ้าเจอ Parent
        if (node.id === newReply.parent.id) {
            return {
                ...node,
                children: [...(node.children || []), newReply]
            };
        }
        // 2. ถ้าไม่เจอ ให้ค้นหาใน children ต่อไป (Recursive)
        if (node.children && node.children.length > 0) {
            return {
                ...node,
                children: addReplyToTree(node.children, newReply)
            };
        }
        // 3. ถ้าไม่เจอและไม่มี children ก็ return node เดิม
        return node;
    });
};

// Helper Function: สำหรับอัปเดต Comment Reaction ใน State (Tree)
const updateCommentReactionInTree = (nodes, updatedComment) => {
    return nodes.map(node => {
        // 1. ถ้าเจอ Comment ที่ถูกอัปเดต
        if (node.id === updatedComment.id) {
            return {
                ...node,
                commentReactions: updatedComment.commentReactions, 
            };
        }
        // 2. ถ้าไม่เจอ ให้ค้นหาใน children ต่อไป (Recursive)
        if (node.children && node.children.length > 0) {
            return {
                ...node,
                children: updateCommentReactionInTree(node.children, updatedComment)
            };
        }
        // 3. ไม่เจอ ก็ return node เดิม
        return node;
    });
};

export const NoteDetailPage = ({ token, user }) => {
    const [note, setNote] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [message, setMessage] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalReactions, setModalReactions] = useState(null);

    // State สำหรับเก็บ ID ของ Comment ที่กำลังจะ Reply
    const [replyingTo, setReplyingTo] = useState(null); // (null = Comment หลัก, number = Reply)

    const { id } = useParams();

    const fetchWithAuth = (url, options = {}) => {
        const headers = {
            ...options.headers,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
        return fetch(url, { ...options, headers });
    };

    // Effect สำหรับดึงข้อมูล Note (เมื่อ id เปลี่ยน)
    useEffect(() => {
        const fetchNote = async () => {
            try {
                const response = await fetchWithAuth(`${NOTE_API_URL}/${id}`);
                if (!response.ok) throw new Error('Note not found');
                setNote(await response.json());
            } catch (err) { setMessage(err.message); }
        };
        fetchNote();
    }, [id, token]);

    // Effect สำหรับดึง Comments (เมื่อ id เปลี่ยน)
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetchWithAuth(`${COMMENT_API_URL}/note/${id}`);
                if (!response.ok) throw new Error('Could not fetch comments');
                setComments(await response.json());
            } catch (err) { setMessage(err.message); }
        };
        fetchComments();
    }, [id, token]);

    // ฟังก์ชันสร้าง Comment
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (newComment.trim() === '') return;

        //สร้าง body ที่จะส่ง
        const body = {
            content: newComment,
            parentId: replyingTo,
        };

        try {
            const response = await fetchWithAuth(`${COMMENT_API_URL}/note/${id}`, {
                method: 'POST',
                body: JSON.stringify(body),
            });
            if (!response.ok) throw new Error('Failed to post comment');

            const createdComment = await response.json();

            createdComment.user = user;
            if (createdComment.parent) {
                createdComment.parent = { id: replyingTo };
            }

            // อัปเดต State แบบ Tree
            if (createdComment.parent) {
                // 1. ถ้าเป็น Reply: ใช้ Helper Function
                setComments(prevComments => addReplyToTree(prevComments, createdComment));
            } else {
                // 2. ถ้าเป็น Comment หลัก: เพิ่มที่ท้าย Array
                setComments(prevComments => [...prevComments, createdComment]);
            }

            setNewComment('');
            setIsModalOpen(false);
            setReplyingTo(null); 
        } catch (err) { setMessage(err.message); }
    };

    // เมื่อกดปุ่ม Reply บน Comment
    const handleReplyClick = (commentId) => {
        setReplyingTo(commentId); 
        setIsModalOpen(true);    
    };

    // เมื่อกดปุ่ม "Write a Comment" (ปุ่มหลัก)
    const handleWriteNewCommentClick = () => {
        setReplyingTo(null); 
        setIsModalOpen(true);  
    };

    // เมื่อปิด Modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setReplyingTo(null);
    };

    // Like/Dislike Comment
    const handleCommentReact = async (commentId, type) => {
        try {
            const response = await fetchWithAuth(
                `${COMMENT_API_URL}/${commentId}/react`,
                {
                    method: 'POST',
                    body: JSON.stringify({ type: type }),
                }
            );
            if (!response.ok) throw new Error('Failed to react to comment');

            const updatedComment = await response.json();

            // อัปเดต State โดยใช้ Helper ใหม่
            setComments(prevComments =>
                updateCommentReactionInTree(prevComments, updatedComment)
            );
        } catch (error) {
            setMessage(error.message);
        }
    };

    // ฟังก์ชัน handleReaction
    const handleReaction = async (noteId, type) => {
        try {
            const response = await fetchWithAuth(`${NOTE_API_URL}/${noteId}/react`, {
                method: 'POST',
                body: JSON.stringify({ type: type }),
            });
            if (!response.ok) throw new Error('Failed to set reaction');
            const updatedNote = await response.json();
            setNote(updatedNote);
        } catch (error) { setMessage(error.message); }
    };

    if (message) return <p style={styles.message}>{message}</p>;
    if (!note) return <p>Loading note...</p>;

    // Logic คำนวณวันที่
    const noteDate = new Date(note.createdAt);
    const noteUpdatedDate = new Date(note.updatedAt);
    // เช็คว่าเวลา update ต่างจากเวลา create เกิน 1 นาทีหรือไม่ (60000ms)
    const isEdited = (noteUpdatedDate.getTime() - noteDate.getTime()) > 60000;

    const displayDate = isEdited
        ? `${noteUpdatedDate.toLocaleString()} (แก้ไข)`
        : noteDate.toLocaleString();

    // คำนวณ Reactions
    const myReaction = note.reactions.find(r => r.user.id === user.id);
    const reactionCounts = note.reactions.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1; return acc;
    }, {});
    const sortedReactions = Object.entries(reactionCounts).sort(([, a], [, b]) => b - a);

    return (
        <div style={styles.container}>
            {/* --- ส่วนแสดงผล Note --- */}
            <div style={styles.noteItem}>
                <span style={styles.noteTitle}>{note.title}</span>

                {note.imageUrl && (
                    // 
                    <img src={note.imageUrl} alt={note.title} style={styles.noteImage} />
                )}

                {/* <p style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p> */}
                <p style={styles.noteContentSnippet}>{note.content}</p>
                <div style={styles.authorContainer}>
                    <small style={styles.author}>By: {note.user?.email || 'Unknown'}</small>
                    {/* (เพิ่ม <small> สำหรับวันที่) */}
                    <small style={styles.noteDate}>{displayDate}</small>
                </div>

                <div style={styles.reactionBar}>
                    {Object.keys(reactionEmojis).map(type => (
                        <button key={type}
                            onClick={() => handleReaction(note.id, type)}
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
                        onClick={() => setModalReactions(note.reactions)} 
                    >
                        {sortedReactions.map(([type, count]) => (
                            <span key={type} style={styles.reactionCount}>
                                {reactionEmojis[type]} {count}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* --- ส่วน Comment --- */}
            <div style={styles.commentSection}>
                <h3 style={styles.commentsHeader}>
                    Comments ({comments.length})
                    <button
                        onClick={handleWriteNewCommentClick}
                        style={styles.commentIconButton}
                        title="Write a Comment"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            <line x1="8" y1="10" x2="8" y2="10"></line>
                            <line x1="12" y1="10" x2="12" y2="10"></line>
                            <line x1="16" y1="10" x2="16" y2="10"></line>
                        </svg>

                    </button>
                </h3>

                {/* รายการ Comments */}
                <ul style={styles.commentList}>
                    {comments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onReplyClick={handleReplyClick} 
                            userId={user.id} 
                            onCommentReact={handleCommentReact}
                        />
                    ))}
                </ul>
            </div>

            {/* Modal สำหรับเขียน Comment (เหมือนเดิม) */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        {/* เปลี่ยนหัวข้อ Modal ตามสถานการณ์ */}
                        <h3>{replyingTo ? 'Write a Reply' : 'Write a Comment'}</h3>
                        <form onSubmit={handleCommentSubmit} style={styles.commentForm}>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={replyingTo ? 'Write a reply...' : 'Write a comment...'} 
                                style={styles.textarea}
                                autoFocus
                            />
                            <div style={styles.modalActions}>
                                <button type="submit" style={styles.button}>
                                    {replyingTo ? 'Post Reply' : 'Post Comment'} 
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={styles.modalCloseButton}
                                >
                                    Close
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalReactions && (
                <ReactionModal
                    reactions={modalReactions}
                    onClose={() => setModalReactions(null)}
                />
            )}
        </div>
    );
};

// 2. CSS 
const styles = {
    container: { width: '600px', padding: '0', color: '#e0e0e0' },
    message: { color: 'red' },
    noteItem: {
        backgroundColor: '#555', padding: '20px', marginBottom: '20px',
        borderRadius: '5px', textAlign: 'left', position: 'relative',
    },
    noteTitle: {
        fontSize: '1.6em', fontWeight: 'bold', color: '#FFD700',
        marginBottom: '15px', display: 'block',
    },
    noteContentSnippet: {
        whiteSpace: 'pre-wrap', // เก็บการขึ้นบรรทัดไว้
        wordBreak: 'break-word', // ป้องกันข้อความยาวเกินไป
        color: '#e0e0e0',
        marginTop: '15px',
    },
    noteImage: {
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '5px',
        margin: '15px 0', // เว้นระยะห่างจากชื่อและเนื้อหา
        display: 'block', // ทำให้กินพื้นที่เต็มบรรทัด
    },
    author: {
        color: '#bbb',
        fontStyle: 'italic',
    },
    authorContainer: {
        color: '#bbb',
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    noteDate: {
        color: '#bbb',
        // fontStyle: 'italic',
        fontSize: '0.9em',
    },
    reactionBar: {
        display: 'flex',
        gap: '5px',
        borderTop: '1px solid #666',
        paddingTop: '10px',
        marginTop: '15px',
    },
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
    },
    commentSection: {
        backgroundColor: '#444',
        padding: '20px',
        borderRadius: '5px',
    },
    commentsHeader: {
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px', 
        color: '#e0e0e0', 
    },
    commentIconButton: {
        backgroundColor: 'transparent', 
        border: 'none', 
        color: '#ffffff', 
        fontSize: '1.5em', 
        cursor: 'pointer',
        padding: '5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.2s ease',
    },
    // commentIconButton: hover: {
    //     color: '#FFEA00',
    // },
    commentForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    textarea: {
        padding: '10px', borderRadius: '5px', border: '1px solid #666',
        backgroundColor: '#555', color: '#e0e0e0', fontSize: '1em',
        fontFamily: 'Arial, sans-serif', resize: 'vertical', minHeight: '120px',
    },
    button: {
        padding: '10px', backgroundColor: '#007bff', color: 'white',
        border: 'none', borderRadius: '5px', cursor: 'pointer',
        alignSelf: 'flex-start',
    },
    commentList: { listStyle: 'none', padding: 0, marginTop: '20px' },
    commentItem: {
        backgroundColor: '#555',
        padding: '10px 15px',
        borderRadius: '5px',
        marginBottom: '10px',
        textAlign: 'left',
    },

    commentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        // ทำให้ <strong> ที่อยู่ข้างใน หนาและสีสว่าง
        color: '#ffffff',
        fontWeight: 'bold',
    },
    commentTimestamp: {
        color: '#bbb', 
        fontSize: '0.85em', 
    },
    commentContent: {
        margin: 0,
        color: '#e0e0e0',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
    },
    commentActions: {
        marginTop: '10px',
        display: 'flex',
        gap: '10px',
    },
    replyButton: {
        background: 'none',
        border: 'none',
        color: '#FFD700',
        cursor: 'pointer',
        fontSize: '0.9em',
        fontWeight: 'bold',
        padding: '0',
    },
    nestedComments: {
        marginLeft: '20px',
        borderLeft: '2px solid #666',
        paddingTop: '10px',
        paddingLeft: '10px',
        marginTop: '10px',
    },

    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#555',
        padding: '20px',
        borderRadius: '5px',
        width: '500px',
        maxWidth: '90%',
        color: '#e0e0e0',
        textAlign: 'left',
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '15px',
    },
    modalCloseButton: {
        padding: '10px 15px',
        backgroundColor: '#888',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    }
};