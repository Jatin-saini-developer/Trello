import { useEffect, useState } from 'react';

// IssueCard — displays a single issue inside a section column.
// Props:
//   issue   — issue object { _id, title, description, sectionId, boardId }
//   index   — position in the column (staggers the entrance animation)
//   accent  — colour of the little bar on the left edge

const IssueCard = ({ issue, index = 0, accent = '#D97757' }) => {
    // Cards rise in one after another; new issues animate in too
    const [on, setOn] = useState(false);
    useEffect(() => {
        const id = requestAnimationFrame(() => setOn(true));
        return () => cancelAnimationFrame(id);
    }, []);

    return (
        <div
            style={{ transitionDelay: on ? `${Math.min(index, 8) * 50}ms` : '0ms' }}
            className={`transition-all duration-500 ease-out ${on ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
        >
            <div
                className="
                    relative cursor-pointer overflow-hidden rounded-xl border border-[#E4DDCD] bg-white
                    py-3 pl-4 pr-3.5
                    shadow-[0_6px_14px_-10px_rgba(70,45,10,0.45)]
                    transition-all duration-200
                    hover:-translate-y-0.5 hover:border-[#d6cdb8]
                    hover:shadow-[0_16px_26px_-14px_rgba(70,45,10,0.5)]
                "
            >
                {/* Accent bar */}
                <span
                    className="absolute inset-y-3 left-0 w-[3px] rounded-r"
                    style={{ background: accent }}
                />

                {/* Issue title */}
                <p className="text-[14px] font-bold leading-snug text-[#1B1A17]">
                    {issue.title}
                </p>

                {/* Issue description — truncated to 2 lines */}
                {issue.description && (
                    <p
                        className="
                            mt-1 overflow-hidden text-[12px] leading-relaxed text-[#7A756B]
                            [display:-webkit-box]
                            [-webkit-box-orient:vertical]
                            [-webkit-line-clamp:2]
                        "
                    >
                        {issue.description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default IssueCard;