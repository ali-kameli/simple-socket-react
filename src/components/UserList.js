import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const UserList = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  console.log(token);
  
  useEffect(() => {
    console.log("token",token);

    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/employee/list",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    fetchUsers();

    const socket = io("http://localhost:3000", {
      auth: {
        token
      },
    });

    // socket.emit("sup", {
    //   title: "getttttttttttttttttttttttttttttttttttt"
    // });
    socket.on("user_list", (updatedUsers) => {
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
        {users.map((user) => (
          <li key={user.id} onClick={() => onSelectUser(user.id)}>
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
