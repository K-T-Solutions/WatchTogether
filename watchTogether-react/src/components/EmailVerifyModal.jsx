import { useEffect, useRef, useState } from 'react';

export default function EmailVerifyModal({
  email,
  onClose,
  onVerify,
  onResend,
  resendCooldown = 0,
  isResending = false,
  resetSignal = 0
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState(300); // 5 minutes
  const inputsRef = useRef([]);

  // Autofocus first input
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => setRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [remaining]);

  // Reset timer when resetSignal changes
  useEffect(() => {
    setRemaining(300);
    setDigits(['', '', '', '', '', '']);
    setError('');
    inputsRef.current[0]?.focus();
  }, [resetSignal]);

  const handleChange = (idx, val) => {
    if (val.length > 1) val = val.slice(-1);
    const next = [...digits];
    next[idx] = val.replace(/\D/g, '');
    setDigits(next);
    if (val && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const code = digits.join('');
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  const submit = async (e) => {
    e.preventDefault();
    if (remaining === 0) {
      setError('Code expired. Please resend a new code.');
      return;
    }
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setError('');
    const ok = await onVerify(code);
    if (!ok) {
      setError('Invalid or expired code.');
    }
  };

  const resend = async () => {
    const sent = await onResend();
    if (sent) {
      // parent should bump resetSignal, but keep local UX smooth
      setRemaining(300);
      setDigits(['', '', '', '', '', '']);
      setError('A new code was sent.');
      inputsRef.current[0]?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#181828] p-8 rounded-2xl shadow-lg w-full max-w-md border border-[#232346]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-white text-2xl font-bold">Verify your email</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <p className="text-gray-300 text-sm mb-4">
          We've sent a 6‑digit verification code to <span className="text-indigo-400">{email}</span>.
        </p>

        <div className="flex justify-center gap-3 mb-4">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-12 text-center text-white text-xl font-bold bg-[#232346] border border-[#3a3a5a] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ))}
        </div>

        {/* Expiration timer centered above Verify button */}
        <div className="text-center text-gray-400 text-sm mb-3">Code expires in <span className="text-white font-medium">{minutes}:{seconds}</span></div>

        {error && <div className="text-red-400 text-sm mb-3 text-center">{error}</div>}

        {/* Full-width Verify button */}
        <button onClick={submit} disabled={remaining === 0} className="w-full h-11 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50">
          Verify
        </button>

        {/* Resend below: show timer text when disabled */}
        <div className="mt-3 text-center">
          {resendCooldown > 0 || isResending ? (
            <span className="text-gray-500 text-sm">Resend available in {resendCooldown}s</span>
          ) : (
            <button onClick={resend} className="text-indigo-400 hover:text-indigo-300 text-sm">
              Resend code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


