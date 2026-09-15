// IssueCard — displays a single issue inside a section column.
// Props:
//   issue  — issue object { _id, title, description, sectionId, boardId }

const IssueCard = ({ issue }) => {
    return (
        <div
            className="
                bg-white rounded-xl border border-[#E8E4DC]
                px-3.5 py-3 cursor-pointer
                shadow-[0_1px_3px_rgba(0,0,0,0.06)]
                hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)]
                hover:-translate-y-[1px]
                transition-all duration-150
            "
        >
            {/* Issue title */}
            <p className="text-[13.5px] font-medium text-[#1A1A1A] leading-snug">
                {issue.title}
            </p>

            {/* Issue description — truncated to 2 lines */}
            {issue.description && (
                <p
                    className="
                        mt-1 text-[12px] text-[#9B9590] leading-relaxed
                        overflow-hidden
                        [display:-webkit-box]
                        [-webkit-box-orient:vertical]
                        [-webkit-line-clamp:2]
                    "
                >
                    {issue.description}
                </p>
            )}
        </div>
    );
};

export default IssueCard;
