import {useState} from "react";

export default function Login({onSwitchToRegister, onClose, onLogin}) {
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user || !password) {
            setError("Please fill in all fields");
            return;
        }
        setError("");

        // Имитация успешного входа
        const userData = {
            username: user,
            email: user.includes('@') ? user : `${user}@example.com`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`,
            id: Date.now()
        };

        onLogin(userData);
    };

    return (
        <form onSubmit={handleSubmit}
              className="bg-[#181828] p-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-6 border border-[#232346]">
            <h2 className="text-white text-2xl font-bold mb-2 text-center">Sign In</h2>
            <input
                type="text"
                placeholder="Username or Email"
                className="p-3 rounded bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={user}
                onChange={e => setUser(e.target.value)}
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
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}

            {/*<button type="submit" className="bg-gradient-to-tr from-indigo-500 to-pink-500 text-white font-bold py-2 rounded hover:opacity-90 transition">Sign In</button>*/}
            <button type="submit"
                    className="bg-gradient-to-tr from-[#4063bd] to-[#e8652d] text-white font-bold py-2 rounded hover:opacity-90 hover:cursor-pointer transition">Sign
                In
            </button>
            <div className="text-gray-400 text-sm text-center">
                Don't have an account? <button type="button" className="text-indigo-400 hover:underline hover:cursor-pointer"
                                               onClick={onSwitchToRegister}>Sign Up</button>
            </div>
        </form>
    );
} 