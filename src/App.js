import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register'; 
import Chat from './components/chat';

const App = () => {
    const [token, setToken] = useState('');

    return (
        <div>
            {!token ? (
                <>
                    <Login setToken={setToken} />
                    <Register />
                </>
            ) : (
                <Chat token={token} />
            )}
        </div>
    );
};

export default App;
