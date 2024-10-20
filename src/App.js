import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register'; 
import UserList from './components/UserList';
import License from './components/License';
import Ticket from './components/Tickett';

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
                    <div style={{display:"flex", justifyContent:"space-evenly"}}>
                    <License token={token} receiverId={selectedUserId} onBack={() => setSelectedUserId(null)} />
                    <Ticket token={token} receiverId={selectedUserId} onBack={() => setSelectedUserId(null)} />
                    </div>
                ) : (
                    <UserList token={token} onSelectUser={setSelectedUserId} />
                )
            )}
        </div>
    );
};

export default App;
