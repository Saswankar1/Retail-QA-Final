import { useState } from "react";
import axios from "axios";
import "./Login.css"; 
function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please fill both fields.");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/login", {
        username,
        password,
      });

      if (res.data.success) {
        onLogin(); 
      }
    } catch (err) {
      console.error(err);
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="login-container">
      <h2>🗄️ Retail Q&A Tool Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div class="login-header">
          <p class="login-subtitle">Please enter your details</p>
          <h3 class="login-title">Welcome back</h3>
        </div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="error">{error}</div>}

        <button className="midBtn1" type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
