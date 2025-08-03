import { useState } from "react";
import { useMutation } from '@apollo/client';
import { REGISTER_MUTATION } from '../graphql/auth';

export default function Register({ onSwitchToLogin, onClose }) {
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [registerMutation] = useMutation(REGISTER_MUTATION);

  const handleSubmit = async (e) => {
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
    setSuccess("");
    setIsLoading(true);

    try {
      const { data } = await registerMutation({
        variables: {
          login: login,
          email: email,
          password: password
        }
      });

      if (data.register.result) {
        setSuccess("Registration successful! You can now sign in.");
        // Очищаем форму
        setLogin("");
        setEmail("");
        setPassword("");
        setConfirm("");
      } else {
        setError(data.register.message || "Registration failed");
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
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
          disabled={isLoading}
        />
        <input
          type="email"
          placeholder="Email"
          className="p-3 rounded bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={isLoading}
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="p-3 rounded bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full pr-12"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400 hover:cursor-pointer text-sm"
            tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
            disabled={isLoading}
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
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400 hover:cursor-pointer text-sm"
            tabIndex={-1}
            onClick={() => setShowConfirm(v => !v)}
            disabled={isLoading}
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        {success && <div className="text-green-400 text-sm text-center">{success}</div>}
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-gradient-to-tr from-[#4063bd] to-[#e8652d] text-white font-bold py-2 rounded hover:opacity-90 hover:cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing Up..." : "Sign Up"}
        </button>
        <div className="text-gray-400 text-sm text-center">
          Already have an account? <button type="button" className="text-indigo-400 hover:underline hover:cursor-pointer" onClick={onSwitchToLogin}>Sign In</button>
        </div>
      </form>
  );
} 