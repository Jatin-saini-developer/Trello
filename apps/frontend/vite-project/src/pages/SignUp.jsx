import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api.js";

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match.");
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/auth/signup', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            // Store token
            localStorage.setItem('token', data.token);

            // Redirect to home/dashboard
            navigate('/');
        } catch (err) {
            // axios wraps server errors in err.response
            const message = err.response?.data?.message || "Something went wrong.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4 font-sans">

            {/* Card */}
            <div className="w-full max-w-md bg-white border border-[#E8E4DC] rounded-2xl shadow-sm px-8 py-10">

                {/* Logo / Brand mark */}
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-7 h-7 rounded-lg bg-[#D97757] flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
                            <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                            <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                            <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
                        </svg>
                    </div>
                    <span className="text-[15px] font-semibold text-[#1A1A1A] tracking-tight">Trello</span>
                </div>

                {/* Heading */}
                <h1 className="text-[22px] font-semibold text-[#1A1A1A] mb-1 tracking-tight">
                    Create your account
                </h1>
                <p className="text-sm text-[#7A7672] mb-7">
                    Start organising your work in minutes.
                </p>

                {/* Error Banner */}
                {error && (
                    <div className="mb-5 px-4 py-3 rounded-lg bg-[#FEF3EE] border border-[#F5C4AE] text-sm text-[#C0432A] flex items-center gap-2">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                            <circle cx="7.5" cy="7.5" r="6.5" stroke="#C0432A" strokeWidth="1.2" />
                            <path d="M7.5 4.5v3.5" stroke="#C0432A" strokeWidth="1.3" strokeLinecap="round" />
                            <circle cx="7.5" cy="10.5" r="0.75" fill="#C0432A" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="name"
                            className="text-[11px] font-semibold text-[#9B9590] uppercase tracking-widest"
                        >
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E0DDD6] bg-[#FAFAF8] text-[#1A1A1A] text-sm placeholder-[#C4BFB8] outline-none transition-all duration-150 focus:border-[#D97757] focus:ring-2 focus:ring-[#D97757]/15 focus:bg-white"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="email"
                            className="text-[11px] font-semibold text-[#9B9590] uppercase tracking-widest"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@company.com"
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E0DDD6] bg-[#FAFAF8] text-[#1A1A1A] text-sm placeholder-[#C4BFB8] outline-none transition-all duration-150 focus:border-[#D97757] focus:ring-2 focus:ring-[#D97757]/15 focus:bg-white"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="password"
                            className="text-[11px] font-semibold text-[#9B9590] uppercase tracking-widest"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Min. 8 characters"
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E0DDD6] bg-[#FAFAF8] text-[#1A1A1A] text-sm placeholder-[#C4BFB8] outline-none transition-all duration-150 focus:border-[#D97757] focus:ring-2 focus:ring-[#D97757]/15 focus:bg-white"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="confirmPassword"
                            className="text-[11px] font-semibold text-[#9B9590] uppercase tracking-widest"
                        >
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter your password"
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E0DDD6] bg-[#FAFAF8] text-[#1A1A1A] text-sm placeholder-[#C4BFB8] outline-none transition-all duration-150 focus:border-[#D97757] focus:ring-2 focus:ring-[#D97757]/15 focus:bg-white"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-1 py-2.5 rounded-xl bg-[#D97757] hover:bg-[#C96A49] active:bg-[#B85E3E] text-white text-sm font-semibold tracking-wide transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
                                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                                Creating account…
                            </span>
                        ) : "Create Account"}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-[#ECEAE4]" />
                    <span className="text-xs text-[#B5B0A8]">or</span>
                    <div className="flex-1 h-px bg-[#ECEAE4]" />
                </div>

                {/* Login redirect */}
                <p className="text-center text-sm text-[#7A7672]">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-[#D97757] font-semibold hover:text-[#C96A49] transition-colors duration-150"
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
