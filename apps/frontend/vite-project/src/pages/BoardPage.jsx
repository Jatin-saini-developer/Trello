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

// ── Loading skeleton ──────────────────────────────────────────────────────────
const ColumnSkeleton = () => (
    <div className="flex gap-4 items-start">
        {[...Array(4)].map((_, i) => (
            <div
                key={i}
                className="shrink-0 w-[272px] rounded-2xl bg-[#ECEAE4] animate-pulse"
                style={{ height: `${220 + i * 40}px` }}
            />
        ))}
    </div>
);

// ── Error banner ──────────────────────────────────────────────────────────────
const ErrorBanner = ({ message }) => (
    <div className="px-4 py-3 rounded-lg bg-[#FEF3EE] border border-[#F5C4AE] text-sm text-[#C0432A] flex items-center gap-2">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="7.5" r="6.5" stroke="#C0432A" strokeWidth="1.2" />
            <path d="M7.5 4.5v3.5" stroke="#C0432A" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="7.5" cy="10.5" r="0.75" fill="#C0432A" />
        </svg>
        {message}
    </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-24 text-center w-full">
        <div className="w-14 h-14 rounded-2xl bg-[#FEF3EE] border border-[#F5C4AE] flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" stroke="#D97757" strokeWidth="1.5" />
                <rect x="13" y="3" width="8" height="8" rx="2" stroke="#D97757" strokeWidth="1.5" opacity="0.5" />
                <rect x="3" y="13" width="8" height="8" rx="2" stroke="#D97757" strokeWidth="1.5" opacity="0.5" />
                <rect x="13" y="13" width="8" height="8" rx="2" stroke="#D97757" strokeWidth="1.5" opacity="0.3" />
            </svg>
        </div>
        <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-1">No sections yet</h3>
        <p className="text-sm text-[#7A7672] max-w-xs">
            This board has no sections. Add a section to start organizing issues.
        </p>
    </div>
);

// ── BoardPage ─────────────────────────────────────────────────────────────────
const BoardPage = () => {
    const { orgId, boardId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { sections, issues, loading, error } = useSelector((s) => s.board);
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

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans">

            {/* ── Top navbar ───────────────────────────────────── */}
            <header className="shrink-0 h-14 bg-white border-b border-[#E8E4DC] flex items-center px-5 gap-4">

                {/* Back arrow */}
                <button
                    id="board-back-btn"
                    onClick={() => navigate('/dashboard')}
                    className="
                        w-8 h-8 rounded-lg flex items-center justify-center
                        text-[#7A7672] hover:bg-[#F7F4F0] hover:text-[#1A1A1A]
                        transition-colors duration-150
                    "
                    aria-label="Back to dashboard"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Divider */}
                <div className="h-5 w-px bg-[#E8E4DC]" />

                {/* Brand mark */}
                <div className="w-6 h-6 rounded-md bg-[#D97757] flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
                        <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                        <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                        <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
                    </svg>
                </div>

                {/* Board name — shows boardId as placeholder (can be replaced with fetched name) */}
                <h1 className="text-[15px] font-semibold text-[#1A1A1A] tracking-tight truncate">
                    Board
                    <span className="ml-1.5 text-[13px] font-normal text-[#9B9590]">
                        #{boardId}
                    </span>
                </h1>
            </header>

            {/* ── Board canvas ─────────────────────────────────── */}
            <main className="flex-1 overflow-x-auto px-6 py-6">

                {isLoading && <ColumnSkeleton />}

                {!isLoading && errorMessage && <ErrorBanner message={errorMessage} />}

                {!isLoading && !errorMessage && sections.length === 0 && !addingSection && <EmptyState />}

                {!isLoading && !errorMessage && (
                    <div className="flex gap-4 items-start">
                        {sections.map((section) => {
                            const sectionIssues = issues.filter(
                                (issue) => String(issue.sectionId) === String(section._id)
                            );
                            return (
                                <SectionColumn
                                    key={section._id}
                                    section={section}
                                    issues={sectionIssues}
                                />
                            );
                        })}

                        <div className="shrink-0 w-[272px] bg-[#F7F4F0] rounded-2xl border border-[#E8E4DC] px-3 py-3">
                            {!addingSection ? (
                                <button
                                    type="button"
                                    onClick={() => setAddingSection(true)}
                                    className="w-full text-left text-[13px] text-[#9B9590] hover:text-[#1A1A1A] hover:bg-[#ECEAE4] rounded-xl px-3 py-2 transition-colors duration-150 flex items-center gap-2"
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
                                        className="border border-[#E0DDD6] rounded-xl px-3 py-2 focus:border-[#D97757] focus:ring-2 focus:ring-[#D97757]/15 text-sm w-full outline-none bg-white text-[#1A1A1A] placeholder-[#C4BFB8] transition-all duration-150"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleAddSection}
                                            disabled={sectionSubmitting}
                                            className="bg-[#D97757] text-white rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-[#C96A49] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            Add
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelAddSection}
                                            disabled={sectionSubmitting}
                                            className="text-[#9B9590] hover:text-[#1A1A1A] rounded-lg px-2 py-1.5 text-sm transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BoardPage;
