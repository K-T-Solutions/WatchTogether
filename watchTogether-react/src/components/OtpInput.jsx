import { useState, useRef, useEffect } from "react";
import { useLazyQuery } from '@apollo/client';
import { VALIDATE_OTP_QUERY } from '../graphql/auth';
import { getGraphQLErrorMessage } from '../utils/apollo';
import { getUserFromToken } from '../utils/jwt';

export default function OtpInput({ identifier, email, onBack, onLogin, onClose }) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef([]);

    const [runValidateOtp] = useLazyQuery(VALIDATE_OTP_QUERY, { fetchPolicy: 'no-cache' });

    useEffect(() => {
        // Фокусируемся на первом поле при монтировании
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) {
            value = value.slice(-1); // Берем только последний символ
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Переходим к следующему полю, если введен символ
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Переходим к предыдущему полю при нажатии Backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        
        if (otpCode.length !== 6) {
            setError("Please enter the complete 6-digit code");
            return;
        }

        // login required (login or email)
        if (!identifier) {
            setError("Cannot validate code: identifier is missing. Please login again.");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const { data, error: gqlError } = await runValidateOtp({
                variables: {
                    login: identifier,
                    code: otpCode
                }
            });

            if (gqlError) {
                throw gqlError;
            }

            const token = data?.validateOtp?.token;
            if (token) {
                // Сохраняем токен в localStorage
                localStorage.setItem('authToken', token);
                
                // Получаем данные пользователя из токена
                const userData = getUserFromToken(token);
                
                if (userData) {
                    // Добавляем дополнительные данные пользователя
                    const fullUserData = {
                        ...userData,
                        displayName: userData.username,
                        email: email,
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
            } else {
                setError("Invalid verification code");
            }
        } catch (error) {
            console.error('OTP validation error:', error);
            setError(getGraphQLErrorMessage(error, 'Verification failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = () => {
        // Здесь можно добавить логику для повторной отправки кода
        setError("Code resent! Please check your email.");
    };

    return (
        <form onSubmit={handleSubmit}
              className="bg-[#181828] p-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-6 border border-[#232346]">
            <h2 className="text-white text-2xl font-bold mb-2 text-center">Two-Factor Authentication</h2>
            
            <div className="text-gray-300 text-sm text-center mb-4">
                We've sent a 6-digit verification code to <span className="text-indigo-400">{email}</span>
            </div>

            <div className="flex justify-center gap-3 mb-6">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength="1"
                        className="w-12 h-12 text-center text-white text-xl font-bold bg-[#232346] border border-[#3a3a5a] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        disabled={isLoading}
                    />
                ))}
            </div>

            {error && <div className="text-red-400 text-sm text-center">{error}</div>}

            <button 
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-tr from-[#4063bd] to-[#e8652d] text-white font-bold py-3 rounded hover:opacity-90 hover:cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Verifying..." : "Verify Code"}
            </button>

            <div className="flex flex-col gap-3">
                <button 
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-indigo-400 hover:underline hover:cursor-pointer text-sm disabled:opacity-50"
                >
                    Didn't receive the code? Resend
                </button>
                
                <button 
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                    className="text-gray-400 hover:text-white hover:cursor-pointer text-sm disabled:opacity-50"
                >
                    ← Back to Login
                </button>
            </div>
        </form>
    );
}
