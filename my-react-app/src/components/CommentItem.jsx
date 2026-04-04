// src/components/CommentItem.jsx
import React, { useState } from 'react';

const styles = {
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
        color: '#ffffff',
        fontWeight: 'bold',
    },
    commentTimestamp: {
        color: '#bbb',
        fontSize: '0.85em',
        fontWeight: 'normal',
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
        gap: '5px',
        alignItems: 'center',
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
    toggleRepliesButton: {
        background: 'none',
        border: 'none',
        color: '#66b2ff',
        cursor: 'pointer',
        fontSize: '0.9em',
        fontWeight: 'bold',
        padding: '5px 0',
        marginTop: '5px',
    },
    reactionCount: {
        color: '#ccc',
        fontSize: '0.9em',
        // marginLeft: '1px',
    },
    reactionGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px', 
    },
    reactionButton: {
        background: 'none',
        border: 'none',
        color: '#ccc',
        cursor: 'pointer',
        fontSize: '1.2em',
        padding: '0 5px',
        transition: 'color 0.2s ease',
    },
    reactionButtonActive: {
        color: '#FFD700',
    },
};

export const CommentItem = ({ comment, onReplyClick, userId, onCommentReact }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = comment.children && comment.children.length > 0;

    // คำนวณ Like/Dislike
    const likeCount = comment.commentReactions?.filter(r => r.type === 'like').length || 0;
    const dislikeCount = comment.commentReactions?.filter(r => r.type === 'dislike').length || 0;

    // เช็คว่า User นี้กด Like หรือ Dislike อะไรไว้
    const myReaction = comment.commentReactions?.find(r => r.user.id === userId);
    const isLikedByUser = myReaction?.type === 'like';
    const isDislikedByUser = myReaction?.type === 'dislike';

    return (
        <li className="comment-item" style={styles.commentItem}>
            <div style={styles.commentHeader}>
                <strong>{comment.user?.email?.split('@')[0] || '...'}</strong>
                <small style={styles.commentTimestamp}>
                    {new Date(comment.createdAt).toLocaleString()}
                </small>
            </div>
            <p style={styles.commentContent}>{comment.content}</p>

            <div style={styles.commentActions}>
                {/* ปุ่ม Like */}
                <button
                    style={{ ...styles.reactionButton, ...(isLikedByUser && styles.reactionButtonActive) }}
                    onClick={() => onCommentReact(comment.id, 'like')}
                >
                    👍🏻
                </button>
                {likeCount > 0 && <span style={styles.reactionCount}>{likeCount}</span>}

                {/* ปุ่ม Dislike */}
                <button
                    style={{ ...styles.reactionButton, ...(isDislikedByUser && styles.reactionButtonActive) }}
                    onClick={() => onCommentReact(comment.id, 'dislike')}
                >
                    👎🏻
                </button>
                {dislikeCount > 0 && <span style={styles.reactionCount}>{dislikeCount}</span>}

                {/* ปุ่ม Reply */}
                <button
                    style={{ ...styles.replyButton, marginLeft: 'auto' }}
                    onClick={() => onReplyClick(comment.id)}
                >
                    Reply
                </button>
            </div>

            {/* ปุ่ม Toggle Reply */}
            {hasChildren && (
                <button
                    style={styles.toggleRepliesButton}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded
                        ? 'ซ่อนการตอบกลับ' 
                        : `ดูการตอบกลับ ${comment.children.length} รายการ`
                    }
                </button>
            )}

            {hasChildren && isExpanded && (
                <div style={styles.nestedComments}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {comment.children.map(childComment => (
                            <CommentItem
                                key={childComment.id}
                                comment={childComment}
                                onReplyClick={onReplyClick}
                                userId={userId}
                                onCommentReact={onCommentReact}
                            />
                        ))}
                    </ul>
                </div>
            )}
        </li>
    );
};