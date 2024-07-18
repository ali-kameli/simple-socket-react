import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const Chat = ({ token, receiverId, onBack }) => {
    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [roomId, setRoomId] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const newSocket = io('http://localhost:5000', {
            auth: { token }
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket with id:', newSocket.id);
        });

        newSocket.on('private_message', (data) => {
            console.log('Received new message:', data);
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [token]);

    useEffect(() => {
        if (socket && receiverId) {
            axios.get('http://localhost:5000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            }).then(response => {
                const userId = response.data.id;
                setUserId(userId);
                const newRoomId = userId < receiverId ? `${userId}_${receiverId}` : `${receiverId}_${userId}`;
                setRoomId(newRoomId);
                socket.emit('join_room', newRoomId);

                // Fetch previous messages
                axios.get(`http://localhost:5000/api/users/messages/${newRoomId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(response => {
                    setMessages(response.data);
                }).catch(error => {
                    console.error('Error fetching messages', error);
                });
            }).catch(error => {
                console.error('Error fetching user ID', error);
            });
        }
    }, [token, receiverId, socket]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (socket && message && receiverId && roomId) {
            socket.emit('private_message', { content: message, to: receiverId, roomId });
            setMessage('');
        }
    };

    return (
        <div>
            <button onClick={onBack}>Back to User List</button>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <b>{msg.from}:</b> {msg.content}
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage}>
                <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message" />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default Chat;
