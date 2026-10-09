import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addBoard, clearBoardsActionError } from '../../store/dashboardSlice.js';
import api from '../../utils/api.js';

const CreateBoardModal = ({ onClose }) => {
    const dispatch = useDispatch();
    const { selectedOrgId, error } = useSelector((s) => s.dashboard);

    const [title, setTitle] = useState('');
    const [localError, setLocalError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [shown, setShown] = useState(false); // drives the enter animation
    const inputRef = useRef(null);

    const close = () => {
        dispatch(clearBoardsActionError());
        onClose();
    };

    // Auto-focus the input when the modal opens, then fade/slide it in.
    useEffect(() => {
        inputRef.current?.focus();
        const id = requestAnimationFrame(() => setShown(true));
        return () => cancelAnimationFrame(id);
    }, []);

    // Close the modal when the user presses Escape.
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                dispatch(clearBoardsActionError());
                onClose();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose, dispatch]);

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
            // Keep the error local to the modal — don't pollute the global board error.
            setLocalError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const preview = title.trim();
    const shownError = localError || error.boards;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-[#1B1A17]/35 backdrop-blur-[3px] transition-opacity duration-300 ${shown ? 'opacity-100' : 'opacity-0'}`}
                onClick={close}
            />

            {/* Modal panel */}
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="New board"
                    className={`pointer-events-auto w-full max-w-md overflow-hidden rounded-3xl border border-[#E4DDCD] bg-white shadow-[0_50px_90px_-30px_rgba(70,45,10,0.6)] transition-all duration-300 ease-out ${shown ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-95 opacity-0'}`}
                >
                    {/* Live preview: the board tile fills in as you type */}
                    <div className="relative h-36 overflow-hidden bg-[#D97757]">
                        <div className="absolute inset-0 flex gap-2 p-4 opacity-40">
                            {[2, 1, 1].map((n, i) => (
                                <div key={i} className="flex-1 space-y-1.5 rounded-lg bg-white/30 p-1.5">
                                    {Array.from({ length: n }).map((_, k) => (
                                        <div key={k} className="h-4 rounded bg-white/70" />
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-6 pb-4 pt-12">
                            <p className={`truncate font-serif text-3xl leading-tight text-white ${preview ? '' : 'opacity-60'}`}>
                                {preview || 'Untitled board'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={close}
                            aria-label="Close"
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur transition-colors duration-150 hover:bg-white/40"
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    <div className="px-7 pb-7 pt-6">
                        {/* Error from local validation or from the API via Redux */}
                        {shownError && (
                            <div role="alert" className="mb-5 flex items-center gap-2.5 rounded-xl border border-[#f1c3ad] bg-[#fdeee6] px-3 py-2.5 text-sm text-[#a8301a]">
                                <b className="rounded-md bg-[#d6452b] px-2 py-0.5 text-[11px] text-white">Blocked</b>
                                {shownError}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="boardTitle" className="relative block">
                                <input
                                    id="boardTitle"
                                    ref={inputRef}
                                    type="text"
                                    value={title}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                        setLocalError('');
                                    }}
                                    placeholder=" "
                                    className="peer block w-full border-0 border-b border-[#E4DDCD] bg-transparent pb-2 pt-7 text-2xl outline-none"
                                />
                                <span className="pointer-events-none absolute left-0 top-6 text-lg text-[#7A756B] transition-all duration-200 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#C4603F] peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[#C4603F]">
                                    Board name
                                </span>
                                <i className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#D97757] transition-transform duration-500 peer-focus:scale-x-100" />
                            </label>
                            <p className="mb-7 mt-2 text-xs text-[#7A756B]">e.g. Product Roadmap</p>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={close}
                                    className="flex-1 rounded-xl border border-[#E4DDCD] bg-white py-3 text-sm font-bold text-[#7A756B] transition-colors duration-150 hover:bg-[#F4EFE5] hover:text-[#1B1A17]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="group relative isolate flex-1 overflow-hidden rounded-xl bg-[#D97757] py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <span className="absolute inset-0 -z-10 translate-y-full bg-[#1B1A17] transition-transform duration-500 ease-out group-hover:translate-y-0" />
                                    {submitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
            </div>
        </>
    );
};

export default CreateBoardModal;