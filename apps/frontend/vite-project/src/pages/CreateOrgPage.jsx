import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";

const CreateOrgPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Organisation name cannot be empty.");
            return;
        }
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const token = localStorage.getItem("token");
            const { data } = await api.post(
                "/createorg",
                { name: name.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess(`"${data.org.name}" created successfully!`);
            setName("");
            // Redirect after short delay
            setTimeout(() => navigate("/dashboard"), 1500);
        } catch (err) {
            const message =
                err.response?.data?.message || "Something went wrong.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4 font-sans">
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
                    Create an Organisation
                </h1>
                <p className="text-sm text-[#7A7672] mb-7">
                    Give your team a home. You can invite members after setup.
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

                {/* Success Banner */}
                {success && (
                    <div className="mb-5 px-4 py-3 rounded-lg bg-[#EEFAF3] border border-[#A8DFC0] text-sm text-[#1A7A46] flex items-center gap-2">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                            <circle cx="7.5" cy="7.5" r="6.5" stroke="#1A7A46" strokeWidth="1.2" />
                            <path d="M4.5 7.5l2 2 4-4" stroke="#1A7A46" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {success}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Org Name */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="orgName"
                            className="text-[11px] font-semibold text-[#9B9590] uppercase tracking-widest"
                        >
                            Organisation Name
                        </label>
                        <input
                            id="orgName"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError("");
                            }}
                            placeholder="e.g. Acme Corp"
                            required
                            autoFocus
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E0DDD6] bg-[#FAFAF8] text-[#1A1A1A] text-sm placeholder-[#C4BFB8] outline-none transition-all duration-150 focus:border-[#D97757] focus:ring-2 focus:ring-[#D97757]/15 focus:bg-white"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        id="create-org-btn"
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
                                Creating…
                            </span>
                        ) : "Create Organisation"}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-[#ECEAE4]" />
                    <span className="text-xs text-[#B5B0A8]">or</span>
                    <div className="flex-1 h-px bg-[#ECEAE4]" />
                </div>

                {/* Back link */}
                <p className="text-center text-sm text-[#7A7672]">
                    Changed your mind?{" "}
                    <button
                        onClick={() => navigate(-1)}
                        className="text-[#D97757] font-semibold hover:text-[#C96A49] transition-colors duration-150 bg-transparent border-none cursor-pointer p-0"
                    >
                        Go back
                    </button>
                </p>
            </div>
        </div>
    );
};

export default CreateOrgPage;
