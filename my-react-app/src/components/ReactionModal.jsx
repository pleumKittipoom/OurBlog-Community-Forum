import React, { useState } from 'react';

// (เราต้องใช้ Object นี้อีกครั้ง เพื่อแสดงผล)
const reactionEmojis = {
    like: '👍',
    love: '❤️',
    haha: '😂',
    wow: '😮',
    sad: '😢',
    angry: '😡',
};

const ALL_REACTION_TYPES = Object.keys(reactionEmojis);

export const ReactionModal = ({ reactions, onClose }) => {

    // 1. State สำหรับ Reaction Type ที่เลือก
    //    'all' คือค่าเริ่มต้น (แสดงทั้งหมด)
    const [selectedType, setSelectedType] = useState('all');

    // 2. ฟังก์ชันสำหรับกรอง Reactions ที่จะแสดง
    const filteredReactions = reactions.filter(reaction =>
        selectedType === 'all' || reaction.type === selectedType
    );

    // 3. คำนวณจำนวน Reaction แต่ละประเภทสำหรับ Tab Header
    const reactionCounts = reactions.reduce((acc, reaction) => {
        acc[reaction.type] = (acc[reaction.type] || 0) + 1;
        return acc;
    }, {});

    return (
        // 1. "Overlay" (ฉากหลังมืดๆ)
        //    เมื่อคลิกที่ฉากหลัง ให้ปิด Modal (onClose)
        <div style={styles.overlay} onClick={onClose}>

            {/* 2. "Modal Box" (กล่องป๊อปอัป)
           e.stopPropagation() ป้องกันไม่ให้ Modal ปิดตัวเองเมื่อเราคลิกข้างใน */}
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

                {/* 3. Header และปุ่มปิด */}
                <div style={styles.header}>
                    <h4>Reactions</h4>
                    <button onClick={onClose} style={styles.closeButton}>X</button>
                </div>

                {/* 4. Tabs สำหรับเลือกประเภท Reaction */}
                <div style={styles.tabs}>
                    {/* Tab "ทั้งหมด" */}
                    <button
                        style={selectedType === 'all' ? styles.tabButtonActive : styles.tabButton}
                        onClick={() => setSelectedType('all')}
                    >
                        ทั้งหมด ({reactions.length})
                    </button>

                    {/* Tab สำหรับแต่ละ Reaction Type */}
                    {ALL_REACTION_TYPES.map(type => {
                        const count = reactionCounts[type] || 0; // จำนวน Reaction ของประเภทนี้
                        if (count === 0) return null; // ไม่ต้องแสดง Tab ถ้าไม่มี Reaction ประเภทนี้

                        return (
                            <button
                                key={type}
                                style={selectedType === type ? styles.tabButtonActive : styles.tabButton}
                                onClick={() => setSelectedType(type)}
                            >
                                {reactionEmojis[type]} {count}
                            </button>
                        );
                    })}
                </div>

                {/* 4. รายชื่อคนที่ React */}
                <ul style={styles.list}>
                    {filteredReactions.length === 0 && <p>No reactions yet for this type.</p>}
                    {filteredReactions.map((reaction) => (
                        <li key={reaction.id} style={styles.listItem}>
                            <span style={styles.emoji}>{reactionEmojis[reaction.type]}</span>
                            <span>{reaction.user.email}</span>
                        </li>
                    ))}
                </ul>

            </div>
        </div>
    );
};

// 5. CSS สำหรับ Modal
const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: '#444',
        padding: '20px',
        borderRadius: '8px',
        width: '300px',
        maxWidth: '90%',
        color: '#e0e0e0',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.5)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        // borderBottom: '1px solid #666',
        // paddingBottom: '10px',
        // marginBottom: '10px',
    },
    closeButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#e0e0e0',
        fontSize: '1.2em',
        cursor: 'pointer',
    },
    tabs: {
        display: 'flex',
        flexWrap: 'wrap', // ให้ขึ้นบรรทัดใหม่ได้ถ้าปุ่มเยอะเกิน
        gap: '5px',
        borderBottom: '1px solid #666',
        paddingBottom: '10px',
        marginBottom: '10px',
        justifyContent: 'flex-start', // จัดให้ชิดซ้าย
        overflowX: 'auto', // ให้เลื่อนได้แนวนอนถ้าปุ่มเยอะ
    },
    tabButton: {
        backgroundColor: '#555',
        border: '1px solid #777',
        borderRadius: '20px', // ทำให้เป็นวงรี
        padding: '5px 12px',
        cursor: 'pointer',
        color: '#e0e0e0',
        fontSize: '0.9em',
        whiteSpace: 'nowrap', // ไม่ให้ข้อความขึ้นบรรทัดใหม่
    },
    tabButtonActive: {
        backgroundColor: '#007bff', // สีฟ้าเมื่อเลือก
        border: '1px solid #0056b3',
        borderRadius: '20px',
        padding: '5px 12px',
        cursor: 'pointer',
        color: '#fff',
        fontSize: '0.9em',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
    },
    list: {
        listStyle: 'none',
        padding: 0,
        marginTop: '15px',
        maxHeight: '300px',
        overflowY: 'auto',
    },
    listItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 0',
        borderBottom: '1px solid #555',
    },
    emoji: {
        fontSize: '1.2em',
    }
};