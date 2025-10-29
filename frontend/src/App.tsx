import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [username, setUsername] = useState("User" + Math.floor(Math.random() * 1000));
  const [roomId, setRoomId] = useState<string>("");
  const [joined, setJoined] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const joinRoom = (room: string) => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          payload: { roomId: room },
        })
      );
      setJoined(true);
      setRoomId(room);
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    wsRef.current = ws;
  };

  const sendMessage = () => {
    const message = inputRef.current?.value?.trim();
    if (!message || !wsRef.current) return;

    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: `${username}: ${message}`,
        },
      })
    );

    inputRef.current?.value || "";
  };

  // --- UI ---
  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
      {!joined ? (
        // --------------- JOIN SCREEN ----------------
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-6">Join a Chat Room</h1>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-4 p-3 rounded-lg text-black outline-none"
          />
          <select
            className="w-full mb-4 p-3 rounded-lg text-black outline-none"
            defaultValue=""
            onChange={(e) => joinRoom(e.target.value)}
          >
            <option value="" disabled>
              Select a Room
            </option>
            <option value="red">Red Room 🔴</option>
            <option value="blue">Blue Room 🔵</option>
            <option value="green">Green Room 🟢</option>
          </select>
          <p className="text-gray-400 text-sm mt-2">Choose a room to start chatting</p>
        </div>
      ) : (
        // --------------- CHAT SCREEN ----------------
        <div className="flex flex-col w-full max-w-2xl bg-gray-900 rounded-2xl shadow-lg h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-purple-700 text-white py-4 px-6 text-lg font-semibold flex justify-between items-center">
            <span>
              💬 Room: <span className="capitalize">{roomId}</span>
            </span>
            <button
              onClick={() => {
                wsRef.current?.close();
                setJoined(false);
                setMessages([]);
              }}
              className="bg-white text-purple-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200"
            >
              Leave
            </button>
          </div>

          {/* Chat area */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide bg-gray-950"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.startsWith(username)
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs sm:max-w-sm md:max-w-md px-4 py-2 rounded-2xl shadow-md ${
                    msg.startsWith(username)
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-gray-200 text-black rounded-bl-none"
                  }`}
                >
                  {msg}
                </div>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="w-full bg-gray-100 flex items-center p-3 border-t border-gray-300">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              className="flex-1 p-3 bg-white rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-purple-500 mr-3 text-black"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-xl shadow-md cursor-pointer transition-all"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
