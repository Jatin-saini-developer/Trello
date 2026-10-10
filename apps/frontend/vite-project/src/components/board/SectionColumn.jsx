import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addIssue } from '../../store/boardSlice.js';
import api from '../../utils/api.js';
import { tileColor } from '../../utils/orgTile.js';
import IssueCard from './IssueCard.jsx';

// SectionColumn - one column for a single section.
// Props:
//   section - section object { _id, title, boardId }
//   issues  - array of issues already filtered for this section

const field =
    'w-full rounded-xl border border-[#E4DDCD] bg-[#FBF8F1] px-3 py-2 text-sm outline-none transition-all duration-150 placeholder:text-[#b3ab9b] focus:border-[#D97757] focus:bg-white focus:ring-2 focus:ring-[#D97757]/15';

const SectionColumn = ({ section, issues, orgId, boardId }) => {
    const dispatch = useDispatch();
    const [addingIssue, setAddingIssue] = useState(false);
    const [issueTitle, setIssueTitle] = useState('');
    const [issueDescription, setIssueDescription] = useState('');
    const [issueSubmitting, setIssueSubmitting] = useState(false);
    const titleInputRef = useRef(null);

    // Each section gets a colour from its name (used for the dot and the card bars)
    const accent = tileColor(section.title);

    useEffect(() => {
        if (addingIssue) {
            titleInputRef.current?.focus();
        }
    }, [addingIssue]);

    const handleAddIssue = async () => {
        if (issueSubmitting) {
            return;
        }

        const title = issueTitle.trim();
        const description = issueDescription.trim();

        if (!title || !description) {
            return;
        }

        setIssueSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const { data } = await api.post(
                `/dashboard/organizations/${orgId}/boards/${boardId}/sections/${section._id}/issues`,
                { title, description },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            dispatch(addIssue(data.issue));
            setIssueTitle('');
            setIssueDescription('');
            setAddingIssue(false);
        } catch (err) {
            console.error('Failed to create issue', err);
        } finally {
            setIssueSubmitting(false);
        }
    };

    const cancelAddIssue = () => {
        if (issueSubmitting) {
            return;
        }

        setAddingIssue(false);
        setIssueTitle('');
        setIssueDescription('');
    };

    const handleIssueKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddIssue();
        }

        if (e.key === 'Escape') {
            cancelAddIssue();
        }
    };

    return (
        <div
            className="
                flex max-h-[calc(100vh-9rem)] w-[17rem] shrink-0 flex-col gap-2
                rounded-2xl border border-[#E4DDCD] bg-white/55 backdrop-blur-sm
                px-3 pb-4 pt-3
            "
        >
            {/* Column header */}
            <div className="mb-1 flex items-center justify-between px-1">
                <h2 className="flex min-w-0 items-center gap-2 text-[13px] font-bold tracking-tight">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: accent }} />
                    <span className="truncate">{section.title}</span>
                </h2>
                <span className="ml-2 shrink-0 rounded-full bg-[#ece5d6] px-2 py-0.5 text-[11px] font-medium text-[#7A756B]">
                    {issues.length}
                </span>
            </div>

            {!addingIssue ? (
                <button
                    type="button"
                    onClick={() => setAddingIssue(true)}
                    className="mb-2 flex w-full items-center gap-2 rounded-xl border border-dashed border-[#d9d0bb] px-3 py-2 text-left text-[13px] font-bold text-[#7A756B] transition-all duration-150 hover:border-[#D97757]/60 hover:bg-white hover:text-[#C4603F]"
                >
                    <span aria-hidden="true">+</span>
                    Add issue
                </button>
            ) : (
                <div className="mb-2 space-y-2 rounded-xl border border-[#E4DDCD] bg-white p-2.5 shadow-[0_16px_28px_-18px_rgba(70,45,10,0.5)]">
                    <input
                        ref={titleInputRef}
                        type="text"
                        value={issueTitle}
                        onChange={(e) => setIssueTitle(e.target.value)}
                        onKeyDown={handleIssueKeyDown}
                        placeholder="Issue title"
                        className={field}
                    />
                    <textarea
                        rows={2}
                        value={issueDescription}
                        onChange={(e) => setIssueDescription(e.target.value)}
                        onKeyDown={handleIssueKeyDown}
                        placeholder="Description"
                        className={`${field} resize-none`}
                    />
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleAddIssue}
                            disabled={issueSubmitting || !issueTitle.trim() || !issueDescription.trim()}
                            className="group relative isolate overflow-hidden rounded-lg bg-[#D97757] px-4 py-1.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span className="absolute inset-0 -z-10 translate-y-full bg-[#1B1A17] transition-transform duration-500 ease-out group-hover:translate-y-0" />
                            Add
                        </button>
                        <button
                            type="button"
                            onClick={cancelAddIssue}
                            disabled={issueSubmitting}
                            className="rounded-lg px-2 py-1.5 text-sm text-[#7A756B] transition-colors duration-150 hover:text-[#1B1A17] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Issue list - scrollable */}
            <div className="flex flex-col gap-2 overflow-y-auto pr-0.5">
                {issues.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-[#E4DDCD] py-6 text-center text-xs text-[#9a9181]">
                        No issues yet
                    </p>
                ) : (
                    issues.map((issue, i) => (
                        <IssueCard key={issue._id} issue={issue} index={i} accent={accent} />
                    ))
                )}
            </div>
        </div>
    );
};

export default SectionColumn;