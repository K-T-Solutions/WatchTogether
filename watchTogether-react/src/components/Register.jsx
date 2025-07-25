import { useState } from "react";

export default function Register({ onSwitchToLogin, onClose }) {
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!login || !email || !password || !confirm) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    // Registration logic here
  };

  return (
      <form onSubmit={handleSubmit} className="bg-[#181828] p-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-6 border border-[#232346]">
        <h2 className="text-white text-2xl font-bold mb-2 text-center">Sign Up</h2>
        <input
          type="text"
          placeholder="Username"
          className="p-3 rounded bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={login}
          onChange={e => setLogin(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="p-3 rounded bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="p-3 rounded bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full pr-12"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400 hover:cursor-pointer text-sm"
            tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            className="p-3 rounded bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full pr-12"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400 hover:cursor-pointer text-sm"
            tabIndex={-1}
            onClick={() => setShowConfirm(v => !v)}
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        <button type="submit" className="bg-gradient-to-tr from-[#4063bd] to-[#e8652d] text-white font-bold py-2 rounded hover:opacity-90 hover:cursor-pointer transition">Sign Up</button>
        <div className="text-gray-400 text-sm text-center">
          Already have an account? <button type="button" className="text-indigo-400 hover:underline hover:cursor-pointer" onClick={onSwitchToLogin}>Sign In</button>
        </div>
      </form>
  );
} 