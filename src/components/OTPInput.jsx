// frontend/src/components/OTPInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

const OTPInput = ({ length = 6, onComplete, onResend, email, expiresIn = 300 }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const [timeLeft, setTimeLeft] = useState(expiresIn);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto focus next input
    if (element.value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all filled
    if (newOtp.every((digit) => digit !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    // Backspace: go to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Arrow keys navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      if (!isNaN(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }

    setOtp(newOtp);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[lastIndex]?.focus();

    // Auto submit if complete
    if (newOtp.every((digit) => digit !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleResend = () => {
    setTimeLeft(expiresIn);
    setCanResend(false);
    setOtp(new Array(length).fill(''));
    inputRefs.current[0]?.focus();
    onResend();
  };

  return (
    <div className="space-y-6">
      {/* OTP Inputs */}
      <div className="flex justify-center gap-2 md:gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            autoFocus={index === 0}
          />
        ))}
      </div>

      {/* Timer & Info */}
      <div className="text-center space-y-3">
        {timeLeft > 0 ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-gray-600">
              Mã có hiệu lực trong{' '}
              <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-red-600 font-medium">
            ⚠️ Mã đã hết hạn
          </p>
        )}

        {/* Email display */}
        <p className="text-xs text-gray-500">
          Mã đã được gửi đến <span className="font-medium">{email}</span>
        </p>

        {/* Resend button */}
        <button
          onClick={handleResend}
          disabled={!canResend}
          className="flex items-center justify-center gap-2 mx-auto px-4 py-2 text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw size={16} className={canResend ? '' : 'opacity-50'} />
          {canResend ? 'Gửi lại mã' : `Gửi lại sau ${formatTime(timeLeft)}`}
        </button>
      </div>
    </div>
  );
};

export default OTPInput;