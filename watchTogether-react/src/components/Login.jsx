import { useState } from "react";
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '../graphql/auth';
import { getGraphQLErrorMessage } from '../utils/apollo';
import { getUserFromToken } from '../utils/jwt';
import OtpInput from './OtpInput';

export default function Login({onSwitchToRegister, onClose, onLogin}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    const [loginMutation] = useMutation(LOGIN_MUTATION);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError("Please fill in all fields");
            return;
        }
        setError("");
        setIsLoading(true);

        try {
            const { data } = await loginMutation({
                variables: {
                    username: username,
                    password: password
                }
            });

            if (data.login.twoFactorRequired) {
                // Если требуется двухфакторная аутентификация
                setUserEmail(username.includes('@') ? username : `${username}@example.com`);
                setShowOtpForm(true);
            } else if (data.login.token) {
                // Обычная аутентификация без 2FA
                handleSuccessfulLogin(data.login.token);
            } else {
                setError("Login failed");
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(getGraphQLErrorMessage(error, 'Login failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccessfulLogin = (token) => {
        // Сохраняем токен в localStorage
        localStorage.setItem('authToken', token);
        
        // Получаем данные пользователя из токена
        const userData = getUserFromToken(token);
        
        if (userData) {
            // Добавляем дополнительные данные пользователя
            const fullUserData = {
                ...userData,
                displayName: userData.username, // Используем username как начальное displayName
                email: username.includes('@') ? username : `${username}@example.com`,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
                friends: [
                    { 
                        username: 'Alice', 
                        displayName: 'Alice Johnson',
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Alice`,
                        id: Date.now() + 1,
                        bio: "Movie enthusiast and coffee lover",
                        followers: 8,
                        following: 15,
                        publicEmail: false,
                        publicFriends: true
                    },
                    { 
                        username: 'Bob', 
                        displayName: 'Bob Smith',
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Bob`,
                        id: Date.now() + 2,
                        bio: "Gaming and streaming fanatic",
                        followers: 23,
                        following: 12,
                        publicEmail: true,
                        publicFriends: false
                    }
                ],
                followers: 12,
                following: 7
            };
            
            onLogin(fullUserData);
        } else {
            setError("Invalid token received");
        }
    };

    const handleBackToLogin = () => {
        setShowOtpForm(false);
        setError("");
    };

    // Если показываем форму OTP
    if (showOtpForm) {
        return (
            <OtpInput 
                email={userEmail}
                onBack={handleBackToLogin}
                onLogin={onLogin}
                onClose={onClose}
            />
        );
    }

    return (
        <form onSubmit={handleSubmit}
              className="bg-[#181828] p-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-6 border border-[#232346]">
            <h2 className="text-white text-2xl font-bold mb-2 text-center">Sign In</h2>
            <input
                type="text"
                placeholder="Username or Email"
                className="p-3 rounded bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={username}
                onChange={e => setUsername(e.target.value)}
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
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}

            <button 
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-tr from-[#4063bd] to-[#e8652d] text-white font-bold py-2 rounded hover:opacity-90 hover:cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Signing In..." : "Sign In"}
            </button>
            <div className="text-gray-400 text-sm text-center">
                Don't have an account? <button type="button" className="text-indigo-400 hover:underline hover:cursor-pointer"
                                               onClick={onSwitchToRegister}>Sign Up</button>
            </div>
        </form>
    );
} 