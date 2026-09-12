import { useSelector } from 'react-redux';
import BoardCard from './BoardCard.jsx';

// ── Loading skeleton ──────────────────────────────────────────────────────────
const BoardSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
            <div
                key={i}
                className="h-24 rounded-2xl bg-[#F0EDE6] animate-pulse"
            />
        ))}
    </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ onCreateBoard }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        {/* Illustration */}
        <div className="w-14 h-14 rounded-2xl bg-[#FEF3EE] border border-[#F5C4AE] flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" stroke="#D97757" strokeWidth="1.5" />
                <rect x="13" y="3" width="8" height="8" rx="2" stroke="#D97757" strokeWidth="1.5" opacity="0.5" />
                <rect x="3" y="13" width="8" height="8" rx="2" stroke="#D97757" strokeWidth="1.5" opacity="0.5" />
                <rect x="13" y="13" width="8" height="8" rx="2" stroke="#D97757" strokeWidth="1.5" opacity="0.3" />
            </svg>
        </div>
        <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-1">
            No boards yet
        </h3>
        <p className="text-sm text-[#7A7672] mb-6 max-w-xs">
            Create your first board to start organising your team's work.
        </p>
        <button
            onClick={onCreateBoard}
            className="px-5 py-2.5 rounded-xl bg-[#D97757] hover:bg-[#C96A49] active:bg-[#B85E3E] text-white text-sm font-semibold transition-all duration-150 shadow-sm hover:shadow-md"
        >
            Create a board
        </button>
    </div>
);

// ── Board Grid ────────────────────────────────────────────────────────────────
const BoardGrid = ({ onCreateBoard }) => {
    const { boards, loading, error } = useSelector((s) => s.dashboard);

    if (loading.boards) return <BoardSkeleton />;

    if (error.boards) {
        return (
            <div className="px-4 py-3 rounded-lg bg-[#FEF3EE] border border-[#F5C4AE] text-sm text-[#C0432A] flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="7.5" cy="7.5" r="6.5" stroke="#C0432A" strokeWidth="1.2" />
                    <path d="M7.5 4.5v3.5" stroke="#C0432A" strokeWidth="1.3" strokeLinecap="round" />
                    <circle cx="7.5" cy="10.5" r="0.75" fill="#C0432A" />
                </svg>
                {error.boards}
            </div>
        );
    }

    if (boards.length === 0) {
        return <EmptyState onCreateBoard={onCreateBoard} />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board, i) => (
                <BoardCard key={board._id} board={board} index={i} />
            ))}
        </div>
    );
};

export default BoardGrid;
