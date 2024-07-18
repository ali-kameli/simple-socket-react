import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register'; 
import UserList from './components/UserList';
import Chat from './components/Chat';

const App = () => {
    const [token, setToken] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);

    return (
        <div>
            {!token ? (
                <>
                    <Login setToken={setToken} />
                    <Register />
                </>
            ) : (
                selectedUserId ? (
                    <Chat token={token} receiverId={selectedUserId} onBack={() => setSelectedUserId(null)} />
                ) : (
                    <UserList token={token} onSelectUser={setSelectedUserId} />
                )
            )}
        </div>
    );
};

export default App;
