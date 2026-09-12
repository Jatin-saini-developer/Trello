import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addBoard, setBoardsActionError } from '../../store/dashboardSlice.js';
import api from '../../utils/api.js';

const CreateBoardModal = ({ onClose }) => {
    const dispatch = useDispatch();
    const { selectedOrgId, error } = useSelector((s) => s.dashboard);

    const [title, setTitle] = useState('');
    const [localError, setLocalError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef(null);

    // Auto-focus the input when the modal opens.
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Close the modal when the user presses Escape.
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    // Called when the form is submitted — create the board via the API.
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            setLocalError('Board name cannot be empty.');
            return;
        }

        setLocalError('');
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const { data } = await api.post(
                `/dashboard/organizations/${selectedOrgId}/boards`,
                { title: title.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Add the new board to the Redux list and close the modal.
            dispatch(addBoard(data.board));
            onClose();
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to create board';
            dispatch(setBoardsActionError(message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
                onClick={onClose}
            />

            {/* Modal panel */}
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div className="w-full max-w-sm bg-white border border-[#E8E4DC] rounded-2xl shadow-lg px-7 py-8">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[17px] font-semibold text-[#1A1A1A] tracking-tight">
                            New Board
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9B9590] hover:bg-[#F0EDE6] hover:text-[#1A1A1A] transition-all duration-150"
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    {/* Error from local validation or from the API via Redux */}
                    {(localError || error.boards) && (
                        <div className="mb-4 px-4 py-3 rounded-lg bg-[#FEF3EE] border border-[#F5C4AE] text-sm text-[#C0432A] flex items-center gap-2">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                                <circle cx="7.5" cy="7.5" r="6.5" stroke="#C0432A" strokeWidth="1.2" />
                                <path d="M7.5 4.5v3.5" stroke="#C0432A" strokeWidth="1.3" strokeLinecap="round" />
                                <circle cx="7.5" cy="10.5" r="0.75" fill="#C0432A" />
                            </svg>
                            {localError || error.boards}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="boardTitle"
                                className="text-[11px] font-semibold text-[#9B9590] uppercase tracking-widest"
                            >
                                Board name
                            </label>
                            <input
                                id="boardTitle"
                                ref={inputRef}
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setLocalError('');
                                }}
                                placeholder="e.g. Product Roadmap"
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E0DDD6] bg-[#FAFAF8] text-[#1A1A1A] text-sm placeholder-[#C4BFB8] outline-none transition-all duration-150 focus:border-[#D97757] focus:ring-2 focus:ring-[#D97757]/15 focus:bg-white"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-[#E0DDD6] bg-white text-[#7A7672] text-sm font-semibold hover:bg-[#F7F4F0] transition-all duration-150"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 py-2.5 rounded-xl bg-[#D97757] hover:bg-[#C96A49] active:bg-[#B85E3E] text-white text-sm font-semibold transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
                                            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                        Creating…
                                    </span>
                                ) : 'Create Board'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateBoardModal;
