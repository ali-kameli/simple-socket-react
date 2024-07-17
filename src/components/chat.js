import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const Chat = ({ token }) => {
    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [receiverId, setReceiverId] = useState('');
    const [userId, setUserId] = useState('');
    const [sentMessages, setSentMessages] = useState([]); // State to store sent messages

    useEffect(() => {
        const newSocket = io('http://localhost:5000', {
            auth: { token }
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket');
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
        axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
            setUserId(response.data.id);
        }).catch(error => {
            console.error('Error fetching user ID', error);
        });
    }, [token]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (socket && message && receiverId) {
            socket.emit('private_message', { content: message, to: receiverId, from: userId });
            setSentMessages((prevMessages) => [...prevMessages, { content: message, from: userId }]);
            setMessage('');
        }
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <b>{msg.from}:</b> {msg.content}
                    </div>
                ))}
                {sentMessages.map((msg, index) => (
                    <div key={index}>
                        <b>You:</b> {msg.content}
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage}>
                <input type="text" value={receiverId} onChange={(e) => setReceiverId(e.target.value)} placeholder="Receiver ID" />
                <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message" />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default Chat;
 