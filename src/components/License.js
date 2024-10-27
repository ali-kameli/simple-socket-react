import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const License = ({ token, receiverId, onBack }) => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [userId, setUserId] = useState("");
  const [account_number, setaccount_number] = useState(3);
  const [license_type, setlicense_type] = useState("negative_balance");

  useEffect(() => {
    const newSocket = io("http://localhost:3000", {
      auth: { token },
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to socket with id:", newSocket.id);
    });

    newSocket.on("license", (data) => {
      console.log("Received new message:", data);
      setMessages((prevMessages) => [...prevMessages, data]); // این خط برای به‌روزرسانی وضعیت استفاده می‌شود
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (socket && receiverId) {
      axios
        .get("http://localhost:3000/employee/get-profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const userId = response.data.employee.id;
          setUserId(userId);

          const newRoomId =
            userId < receiverId
              ? `${userId}_${receiverId}`
              : `${receiverId}_${userId}`;
          setRoomId(newRoomId);
          socket.emit("join_room", newRoomId);

          // دریافت پیام‌های قبلی
          axios
            .get(`http://localhost:3000/manager/license/temp/socket-manager-requests/${newRoomId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
              setMessages(response.data); // پیام‌های قبلی را در وضعیت قرار می‌دهیم
            })
            .catch((error) => {
              console.error("Error fetching messages", error);
            });
        })
        .catch((error) => {
          console.error("Error fetching user ID", error);
        });
    }
  }, [token, receiverId, socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (socket && message && receiverId && roomId) {
      axios
        .post(
          "http://localhost:3000/manager/license/temp/send-request",
          {
            employee_description: message,
            license_type,
            account_number,
            receiverId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          console.log("Request and ticket created:", response.data);
        })
        .catch((error) => {
          console.error("Error creating request and ticket:", error);
        });

      // ارسال پیام به سرور
      socket.emit("license", {
        content: message,
        to: receiverId,
        roomId,
        license_type,
        account_number,
      });

      setMessage(""); // پاک کردن فیلد ورودی
    }
  };

  return (
    <div>
      <h1>مجوز ها</h1>
      <button onClick={onBack}>Back to User List</button>
      <div>
        {messages
          .filter((msgs) => msgs.category === "license")
          .map((msg, index) => (
            <div key={index}>
              <b>{msg.senderId}:</b> {msg.ticket_content}
            </div>
          ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default License;