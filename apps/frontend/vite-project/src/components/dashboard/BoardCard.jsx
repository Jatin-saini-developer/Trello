import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BOARD_COLORS } from '../../utils/orgTile.js';

// How many tiny cards sit in each of the three mini lanes, so covers don't all look the same
const LANE_PATTERNS = [[2, 1, 1], [1, 2, 1], [1, 1, 2], [2, 2, 1], [1, 2, 2], [2, 1, 2]];

const BoardCard = ({ board, index }) => {
    const navigate = useNavigate();
    const { selectedOrgId } = useSelector((s) => s.dashboard);
    const color = BOARD_COLORS[index % BOARD_COLORS.length];
    const lanes = LANE_PATTERNS[index % LANE_PATTERNS.length];

    // Cards rise in one after another when the grid appears
    const [on, setOn] = useState(false);
    useEffect(() => {
        const id = requestAnimationFrame(() => setOn(true));
        return () => cancelAnimationFrame(id);
    }, []);

    return (
        <div
            style={{ transitionDelay: on ? `${Math.min(index, 8) * 60}ms` : '0ms' }}
            className={`transition-all duration-500 ease-out ${on ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
            <button
                onClick={() => navigate(`/org/${selectedOrgId}/board/${board._id}`)}
                className="group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#E4DDCD] bg-white text-left shadow-[0_10px_22px_-16px_rgba(70,45,10,0.5)] outline-none transition-all duration-300 hover:-translate-y-1 hover:border-[#d6cdb8] hover:shadow-[0_26px_40px_-20px_rgba(70,45,10,0.55)] focus-visible:ring-2 focus-visible:ring-[#D97757]/40 active:translate-y-0"
            >
                {/* Cover: a tiny board that lifts a little on hover */}
                <div className="relative h-20 overflow-hidden" style={{ background: color }}>
                    <div className="absolute inset-0 flex gap-1.5 p-3 opacity-45 transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-105">
                        {lanes.map((n, i) => (
                            <div key={i} className="flex-1 space-y-1 rounded-md bg-white/30 p-1">
                                {Array.from({ length: n }).map((_, k) => (
                                    <div key={k} className="h-3 rounded-sm bg-white/80" />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Board title */}
                <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <h3 className="truncate text-[15px] font-bold leading-snug">
                        {board.title}
                    </h3>

                    {/* Open arrow — slides in on hover */}
                    <svg
                        className="shrink-0 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                        width="16" height="16" viewBox="0 0 16 16" fill="none"
                    >
                        <path d="M4 12L12 4M12 4H7M12 4V9" stroke="#D97757" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </button>
        </div>
    );
};

export default BoardCard;