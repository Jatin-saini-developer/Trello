import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    setSectionsLoading,
    setSections,
    addSection,
    setSectionsError,
    setIssuesLoading,
    setIssues,
    setIssuesError,
} from '../store/boardSlice.js';
import api from '../utils/api.js';
import SectionColumn from '../components/board/SectionColumn.jsx';
import { BOARD_COLORS } from '../utils/orgTile.js';

// ── Loading skeleton ──────────────────────────────────────────────────────────
const ColumnSkeleton = () => (
    <div className="flex items-start gap-4">
        {[2, 3, 1, 2].map((n, i) => (
            <div
                key={i}
                style={{ animationDelay: `${i * 120}ms` }}
                className="w-[17rem] shrink-0 animate-pulse rounded-2xl border border-[#E4DDCD] bg-white/50 p-3"
            >
                <div className="mb-3 h-4 w-24 rounded bg-[#ece5d6]" />
                {Array.from({ length: n }).map((_, k) => (
                    <div key={k} className="mb-2 h-16 rounded-xl bg-[#ece5d6]" />
                ))}
            </div>
        ))}
    </div>
);

// ── Error banner ──────────────────────────────────────────────────────────────
const ErrorBanner = ({ message }) => (
    <div role="alert" className="flex items-center gap-2.5 rounded-xl border border-[#f1c3ad] bg-[#fdeee6] px-3 py-2.5 text-sm text-[#a8301a]">
        <b className="rounded-md bg-[#d6452b] px-2 py-0.5 text-[11px] text-white">Blocked</b>
        {message}
    </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }) => (
    <div className="flex w-full flex-col items-center py-16 text-center">
        <div className="mb-7 flex gap-2 rounded-2xl border border-[#E4DDCD] bg-white p-3 shadow-[0_20px_40px_-24px_rgba(70,45,10,0.5)]">
            {[2, 1, 0].map((n, i) => (
                <div key={i} className="w-14 rounded-lg bg-[#F4EFE5] p-1.5">
                    {Array.from({ length: n }).map((_, k) => (
                        <div key={k} className="mb-1.5 h-5 rounded bg-white shadow-sm" />
                    ))}
                    {i === 2 && (
                        <div className="grid h-5 animate-pulse place-items-center rounded border border-dashed border-[#D97757] text-[11px] leading-none text-[#D97757]">+</div>
                    )}
                </div>
            ))}
        </div>
        <h3 className="mb-2 font-serif text-4xl tracking-tight">No sections yet</h3>
        <p className="mb-7 max-w-xs text-sm text-[#7A756B]">
            This board has no sections. Add a section to start organizing issues.
        </p>
        <button
            type="button"
            onClick={onAdd}
            className="group relative isolate overflow-hidden rounded-xl bg-[#D97757] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_20px_-10px_rgba(217,119,87,0.9)]"
        >
            <span className="absolute inset-0 -z-10 translate-y-full bg-[#1B1A17] transition-transform duration-500 ease-out group-hover:translate-y-0" />
            Add a section
        </button>
    </div>
);

// Columns rise in one after another
const Reveal = ({ i, children }) => {
    const [on, setOn] = useState(false);
    useEffect(() => {
        const id = requestAnimationFrame(() => setOn(true));
        return () => cancelAnimationFrame(id);
    }, []);
    return (
        <div
            style={{ transitionDelay: on ? `${Math.min(i, 8) * 70}ms` : '0ms' }}
            className={`shrink-0 transition-all duration-500 ease-out ${on ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
            {children}
        </div>
    );
};

// ── BoardPage ─────────────────────────────────────────────────────────────────
const BoardPage = () => {
    const { orgId, boardId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
    };

    const { sections, issues, loading, error } = useSelector((s) => s.board);
    const dashBoards = useSelector((s) => s.dashboard?.boards);
    const [addingSection, setAddingSection] = useState(false);
    const [sectionTitle, setSectionTitle] = useState('');
    const [sectionSubmitting, setSectionSubmitting] = useState(false);
    const sectionInputRef = useRef(null);

    useEffect(() => {
        if (addingSection) {
            sectionInputRef.current?.focus();
        }
    }, [addingSection]);

    // Fetch sections and issues in parallel on mount
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Kick off both loading states before any await
            dispatch(setSectionsLoading());
            dispatch(setIssuesLoading());

            const [sectionsResult, issuesResult] = await Promise.allSettled([
                api.get(
                    `/dashboard/organizations/${orgId}/boards/${boardId}/sections`,
                    { headers }
                ),
                api.get(
                    `/dashboard/organizations/${orgId}/boards/${boardId}/issues`,
                    { headers }
                ),
            ]);

            // Handle sections result
            if (sectionsResult.status === 'fulfilled') {
                dispatch(setSections(sectionsResult.value.data.sections));
            } else {
                dispatch(setSectionsError(
                    sectionsResult.reason?.response?.data?.error || 'Failed to fetch sections'
                ));
            }

            // Handle issues result
            if (issuesResult.status === 'fulfilled') {
                dispatch(setIssues(issuesResult.value.data.issues));
            } else {
                dispatch(setIssuesError(
                    issuesResult.reason?.response?.data?.error || 'Failed to fetch issues'
                ));
            }
        };

        fetchData();
    }, [orgId, boardId, dispatch]);

    const handleAddSection = async () => {
        if (sectionSubmitting) {
            return;
        }

        const title = sectionTitle.trim();

        if (!title) {
            return;
        }

        setSectionSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const { data } = await api.post(
                `/dashboard/organizations/${orgId}/boards/${boardId}/sections`,
                { title },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            dispatch(addSection(data.section));
            setSectionTitle('');
            setAddingSection(false);
        } catch (err) {
            console.error('Failed to create section', err);
        } finally {
            setSectionSubmitting(false);
        }
    };

    const cancelAddSection = () => {
        if (sectionSubmitting) {
            return;
        }

        setAddingSection(false);
        setSectionTitle('');
    };

    const isLoading = loading.sections || loading.issues;
    const errorMessage = error.sections || error.issues;

    // If we came from the dashboard we already know the board's name and cover colour
    const idx = Array.isArray(dashBoards) ? dashBoards.findIndex((b) => String(b._id) === String(boardId)) : -1;
    const boardMeta = idx >= 0 ? dashBoards[idx] : null;
    const cover = BOARD_COLORS[Math.max(idx, 0) % BOARD_COLORS.length];

    return (
        <div className="relative flex min-h-screen flex-col bg-[#F4EFE5] font-sans text-[#1B1A17]">

            {/* Soft colour blobs behind everything */}
            <i className="pointer-events-none fixed -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-[#ffd6c0] opacity-75 blur-[90px]" />
            <i className="pointer-events-none fixed -bottom-52 -right-40 h-[560px] w-[560px] rounded-full bg-[#d2e6d3] opacity-75 blur-[90px]" />

            {/* ── Top navbar ───────────────────────────────────── */}
            <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-[#E4DDCD] bg-white/70 px-5 backdrop-blur-md">

                {/* Back arrow */}
                <button
                    id="board-back-btn"
                    onClick={() => navigate('/dashboard')}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-[#7A756B] transition-all duration-150 hover:-translate-x-0.5 hover:bg-white hover:text-[#1B1A17]"
                    aria-label="Back to dashboard"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Divider */}
                <div className="h-6 w-px bg-[#E4DDCD]" />

                {/* Board cover (same colour as its card on the dashboard) */}
                <div
                    className="flex h-9 w-9 shrink-0 gap-0.5 rounded-lg p-1.5 shadow-[0_8px_16px_-10px_rgba(70,45,10,0.6)]"
                    style={{ background: cover }}
                >
                    {[2, 1, 1].map((n, i) => (
                        <div key={i} className="flex-1 space-y-0.5">
                            {Array.from({ length: n }).map((_, k) => (
                                <div key={k} className="h-1.5 rounded-sm bg-white/80" />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Board name */}
                <div className="min-w-0 flex-1">
                    <p className="text-xs leading-none text-[#7A756B]">
                        Board{!boardMeta && <span className="ml-1">#{boardId}</span>}
                    </p>
                    <h1 className="mt-1 truncate font-serif text-2xl leading-none tracking-tight">
                        {boardMeta?.title ?? 'Board'}
                    </h1>
                </div>

                {/* Counts */}
                {!isLoading && !errorMessage && (
                    <div className="hidden items-center gap-2 sm:flex">
                        <span className="rounded-md border border-[#E4DDCD] bg-white/70 px-2.5 py-1 text-xs font-medium text-[#7A756B]">
                            {sections.length} {sections.length === 1 ? 'section' : 'sections'}
                        </span>
                        <span className="rounded-md border border-[#E4DDCD] bg-white/70 px-2.5 py-1 text-xs font-medium text-[#7A756B]">
                            {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
                        </span>
                    </div>
                )}

                {/* Logout */}
                <button
                    id="board-logout-btn"
                    onClick={handleLogout}
                    aria-label="Log out"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#7A756B] transition-colors duration-150 hover:bg-[#fdeee6] hover:text-[#b3411f]"
                >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <path d="M6 2H3a1 1 0 00-1 1v9a1 1 0 001 1h3"
                              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        <path d="M10 10l3-3-3-3"
                              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13 7H6"
                              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                </button>
            </header>

            {/* ── Board canvas ─────────────────────────────────── */}
            <main className="relative z-10 flex-1 overflow-x-auto px-6 py-8">

                {isLoading && <ColumnSkeleton />}

                {!isLoading && errorMessage && <ErrorBanner message={errorMessage} />}

                {!isLoading && !errorMessage && sections.length === 0 && !addingSection && (
                    <EmptyState onAdd={() => setAddingSection(true)} />
                )}

                {!isLoading && !errorMessage && (
                    <div className="flex items-start gap-4">
                        {sections.map((section, i) => {
                            const sectionIssues = issues.filter(
                                (issue) => String(issue.sectionId) === String(section._id)
                            );
                            return (
                                <Reveal key={section._id} i={i}>
                                    <SectionColumn
                                        section={section}
                                        issues={sectionIssues}
                                        orgId={orgId}
                                        boardId={boardId}
                                    />
                                </Reveal>
                            );
                        })}

                        <Reveal i={sections.length}>
                            <div
                                className={`w-[17rem] rounded-2xl border p-3 transition-all duration-200 ${addingSection
                                    ? 'border-[#E4DDCD] bg-white shadow-[0_20px_40px_-24px_rgba(70,45,10,0.5)]'
                                    : 'border-dashed border-[#d9d0bb] bg-white/40 hover:border-[#D97757]/60 hover:bg-white/70'}`}
                            >
                                {!addingSection ? (
                                    <button
                                        type="button"
                                        onClick={() => setAddingSection(true)}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-[#7A756B] transition-colors duration-150 hover:text-[#C4603F]"
                                    >
                                        <span aria-hidden="true">+</span>
                                        Add section
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <input
                                            ref={sectionInputRef}
                                            type="text"
                                            value={sectionTitle}
                                            onChange={(e) => setSectionTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddSection();
                                                }

                                                if (e.key === 'Escape') {
                                                    cancelAddSection();
                                                }
                                            }}
                                            placeholder="Section title"
                                            className="w-full rounded-xl border border-[#E4DDCD] bg-[#FBF8F1] px-3 py-2 text-sm outline-none transition-all duration-150 placeholder:text-[#b3ab9b] focus:border-[#D97757] focus:bg-white focus:ring-2 focus:ring-[#D97757]/15"
                                        />
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={handleAddSection}
                                                disabled={sectionSubmitting}
                                                className="group relative isolate overflow-hidden rounded-lg bg-[#D97757] px-4 py-1.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <span className="absolute inset-0 -z-10 translate-y-full bg-[#1B1A17] transition-transform duration-500 ease-out group-hover:translate-y-0" />
                                                Add
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelAddSection}
                                                disabled={sectionSubmitting}
                                                className="rounded-lg px-2 py-1.5 text-sm text-[#7A756B] transition-colors duration-150 hover:text-[#1B1A17] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Reveal>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BoardPage;