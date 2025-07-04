import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { ref, push, onValue, off } from "firebase/database";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  // Logout function
  const handleLogout = () => {
    signOut(auth).then(() => setUser(null));
  };

  // Send message function
  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    push(ref(db, "messages"), {
      text: newMessage,
      sender: user.email,
      timestamp: Date.now(),
    });
    setNewMessage("");
  };

  // Load messages in real-time
  useEffect(() => {
    if (!user) return;

    const messagesRef = ref(db, "messages");
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedMessages = Object.values(data);
        setMessages(loadedMessages);
      }
    });

    return () => off(messagesRef); // Cleanup listener
  }, [user]);

  return (
    <div className="App">
      {!user ? (
        <div className="login">
          <h1>Couple Chat Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      ) : (
        <div className="chat">
          <header>
            <h2>Chat with {user.email === "your-email@example.com" ? "Your GF" : "You"}</h2>
            <button onClick={handleLogout}>Logout</button>
          </header>
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={msg.sender === user.email ? "sent" : "received"}>
                <p>{msg.text}</p>
                <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
              </div>
            ))}
          </div>
          <div className="input-area">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
