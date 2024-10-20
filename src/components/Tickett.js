import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const Ticket = ({ token, receiverId, onBack }) => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const newSocket = io("http://localhost:3000", {
      auth: { token },
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to socket with id:", newSocket.id);
    });

    // دریافت پیام‌های جدید از سوکت و اضافه کردن آن‌ها به لیست پیام‌ها
    newSocket.on("ticket", (data) => {
      console.log("Received new message:", data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (socket && receiverId) {
      // دریافت اطلاعات کاربر فعلی
      axios
        .get("http://localhost:3000/employee/get-profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const userId = response.data.employee.id;
          setUserId(userId);

          // ایجاد RoomId بر اساس شناسه‌های کاربران
          const newRoomId =
            userId < receiverId
              ? `${userId}_${receiverId}`
              : `${receiverId}_${userId}`;
          setRoomId(newRoomId);
          socket.emit("join_room", newRoomId);

          // دریافت پیام‌های قبلی
          axios
            .get(`http://localhost:3000/ticket/messages/${newRoomId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
              setMessages(response.data);
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
      // ایجاد پیام جدید محلی قبل از ارسال به سرور
      const newMessage = {
        senderId: userId,
        ticket_content: message,
        category: "ticket", // اضافه کردن دسته‌بندی پیام
      };

      // اضافه کردن پیام به لیست پیام‌ها بلافاصله پس از ارسال
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // ارسال پیام به سوکت سرور
      socket.emit("ticket", {
        content: message,
        to: receiverId,
        roomId,
        category: "ticket", // ارسال دسته‌بندی به سوکت
      });

      // پاک کردن فیلد ورودی پس از ارسال
      setMessage("");
    }
  };

  return (
    <div>
      <h1>تیکت پشتیبانی</h1>
      <button onClick={onBack}>Back to User List</button>
      <div>
        {messages
          .filter((msgs) => msgs.category === "ticket")
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

export default Ticket;
