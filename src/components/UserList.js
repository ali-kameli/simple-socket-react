import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const UserList = ({ token, onSelectUser }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users', error);
            }
        };

        fetchUsers();

        const socket = io('http://localhost:5000', {
            auth: { token }
        });

        socket.on('user_list', (updatedUsers) => {
            setUsers(updatedUsers);
        });

        return () => {
            socket.disconnect();
        };
    }, [token]);

    return (
        <div>
            <h3>Users</h3>
            <ul>
                {users.map(user => (
                    <li key={user.id} onClick={() => onSelectUser(user.id)}>
                        {user.username}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;
