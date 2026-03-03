import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function Chat() {
  const { token, logoutUser } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [status, setStatus] = useState("");

  const wsRef = useRef(null);

  // 🔌 Connect WebSocket
  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/private?token=${token}`
    );

    socket.onopen = () => {
      console.log("WebSocket connected");
      setStatus("Connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Incoming:", data);

      if (data.type === "private_message") {
        setMessages((prev) => [...prev, data]);
      }

      if (data.type === "read_receipt") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.message_id ? { ...m, is_read: true } : m
          )
        );
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setStatus("Disconnected");
    };

    wsRef.current = socket;

    return () => socket.close();
  }, [token]);

  // 📥 Load old messages
  const loadMessages = async () => {
    if (!receiverId) return alert("Enter receiver ID");

    try {
      const res = await api.get(`/private/messages/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(res.data);
    } catch (err) {
      alert("Failed to load messages");
    }
  };

  // 📤 Send message
  const sendMessage = () => {
    if (!text || !receiverId) return alert("Enter message and receiver");

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return alert("WebSocket not connected");
    }

    wsRef.current.send(
      JSON.stringify({
        type: "message",
        receiver_id: Number(receiverId),
        content: text,
      })
    );

    setText("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Private Chat</h2>
      <p>Status: {status}</p>

      <button onClick={logoutUser}>Logout</button>

      <div>
        <input
          placeholder="Receiver User ID"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
        />
        <button onClick={loadMessages}>Load Chat</button>
      </div>

      <div style={{
        border: "1px solid black",
        height: "300px",
        overflowY: "scroll",
        marginTop: 10,
        padding: 10,
      }}>
        {messages.map((msg, i) => (
          <div key={i}>
            <b>{msg.from || `User ${msg.sender_id}`}:</b> {msg.content}{" "}
            {msg.is_read && "✔✔"}
          </div>
        ))}
      </div>

      <input
        placeholder="Type message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}