import IssueCard from './IssueCard.jsx';

// SectionColumn — one Trello-style column for a single section.
// Props:
//   section  — section object { _id, title, boardId }
//   issues   — array of issues already filtered for this section

const SectionColumn = ({ section, issues }) => {
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

            {/* Issue list — scrollable */}
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
