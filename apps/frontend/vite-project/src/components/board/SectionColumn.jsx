import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addIssue } from '../../store/boardSlice.js';
import api from '../../utils/api.js';
import IssueCard from './IssueCard.jsx';

// SectionColumn - one Trello-style column for a single section.
// Props:
//   section - section object { _id, title, boardId }
//   issues  - array of issues already filtered for this section

const SectionColumn = ({ section, issues, orgId, boardId }) => {
    const dispatch = useDispatch();
    const [addingIssue, setAddingIssue] = useState(false);
    const [issueTitle, setIssueTitle] = useState('');
    const [issueDescription, setIssueDescription] = useState('');
    const [issueSubmitting, setIssueSubmitting] = useState(false);
    const titleInputRef = useRef(null);

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
                flex flex-col gap-2 shrink-0
                w-[272px]
                bg-[#F7F4F0] rounded-2xl border border-[#E8E4DC]
                px-3 pt-3 pb-4
                max-h-[calc(100vh-120px)]
            "
        >
            {/* Column header */}
            <div className="flex items-center justify-between px-1 mb-1">
                <h2 className="text-[13px] font-semibold text-[#1A1A1A] tracking-tight truncate">
                    {section.title}
                </h2>
                <span className="text-[11px] font-semibold text-[#9B9590] bg-[#ECEAE4] rounded-full px-2 py-0.5 shrink-0 ml-2">
                    {issues.length}
                </span>
            </div>

            {!addingIssue ? (
                <button
                    type="button"
                    onClick={() => setAddingIssue(true)}
                    className="w-full text-left text-[13px] text-[#9B9590] hover:text-[#1A1A1A] hover:bg-[#ECEAE4] rounded-xl px-3 py-2 mb-2 transition-colors duration-150 flex items-center gap-2"
                >
                    <span aria-hidden="true">+</span>
                    Add issue
                </button>
            ) : (
                <div className="space-y-2 mb-2">
                    <input
                        ref={titleInputRef}
                        type="text"
                        value={issueTitle}
                        onChange={(e) => setIssueTitle(e.target.value)}
                        onKeyDown={handleIssueKeyDown}
                        placeholder="Issue title"
                        className="border border-[#E0DDD6] rounded-xl px-3 py-2 focus:border-[#D97757] focus:ring-2 focus:ring-[#D97757]/15 text-sm w-full outline-none bg-white text-[#1A1A1A] placeholder-[#C4BFB8] transition-all duration-150"
                    />
                    <textarea
                        rows={2}
                        value={issueDescription}
                        onChange={(e) => setIssueDescription(e.target.value)}
                        onKeyDown={handleIssueKeyDown}
                        placeholder="Description"
                        className="border border-[#E0DDD6] rounded-xl px-3 py-2 focus:border-[#D97757] focus:ring-2 focus:ring-[#D97757]/15 text-sm w-full outline-none bg-white text-[#1A1A1A] placeholder-[#C4BFB8] transition-all duration-150 resize-none"
                    />
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleAddIssue}
                            disabled={issueSubmitting}
                            className="bg-[#D97757] text-white rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-[#C96A49] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                        <button
                            type="button"
                            onClick={cancelAddIssue}
                            disabled={issueSubmitting}
                            className="text-[#9B9590] hover:text-[#1A1A1A] rounded-lg px-2 py-1.5 text-sm transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Issue list - scrollable */}
            <div className="flex flex-col gap-2 overflow-y-auto pr-0.5">
                {issues.length === 0 ? (
                    <p className="text-[12px] text-[#B5B0AA] text-center py-6">
                        No issues
                    </p>
                ) : (
                    issues.map((issue) => (
                        <IssueCard key={issue._id} issue={issue} />
                    ))
                )}
            </div>
        </div>
    );
};

export default SectionColumn;
