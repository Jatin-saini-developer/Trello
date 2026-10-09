import { useSelector } from 'react-redux';
import BoardCard from './BoardCard.jsx';

const ErrorBanner = ({ children }) => (
    <div role="alert" className="flex items-center gap-2.5 rounded-xl border border-[#f1c3ad] bg-[#fdeee6] px-3 py-2.5 text-sm text-[#a8301a]">
        <b className="rounded-md bg-[#d6452b] px-2 py-0.5 text-[11px] text-white">Blocked</b>
        {children}
    </div>
);

// ── Loading skeleton ──────────────────────────────────────────────────────────
const BoardSkeleton = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
            <div
                key={i}
                style={{ animationDelay: `${i * 120}ms` }}
                className="h-28 animate-pulse rounded-2xl bg-[#ece5d6]"
            />
        ))}
    </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ onCreateBoard }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        {/* Tiny empty board with a dashed "your first card" slot */}
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
        <h3 className="mb-2 font-serif text-4xl tracking-tight">No boards yet</h3>
        <p className="mb-7 max-w-xs text-sm text-[#7A756B]">
            Create your first board to start organising your team's work.
        </p>
        <button
            onClick={onCreateBoard}
            className="group relative isolate overflow-hidden rounded-xl bg-[#D97757] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_20px_-10px_rgba(217,119,87,0.9)]"
        >
            <span className="absolute inset-0 -z-10 translate-y-full bg-[#1B1A17] transition-transform duration-500 ease-out group-hover:translate-y-0" />
            Create a board
        </button>
    </div>
);

// ── Board Grid ────────────────────────────────────────────────────────────────
const BoardGrid = ({ onCreateBoard }) => {
    const { boards, loading, error } = useSelector((s) => s.dashboard);

    if (loading.boards) return <BoardSkeleton />;

    if (error.boards) return <ErrorBanner>{error.boards}</ErrorBanner>;

    if (boards.length === 0) {
        return <EmptyState onCreateBoard={onCreateBoard} />;
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {boards.map((board, i) => (
                <BoardCard key={board._id} board={board} index={i} />
            ))}

            {/* Dashed tile at the end of the grid */}
            <button
                onClick={onCreateBoard}
                className="flex min-h-28 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d9d0bb] text-sm font-bold text-[#7A756B] transition-all duration-200 hover:border-[#D97757] hover:bg-white hover:text-[#C4603F]"
            >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                New board
            </button>
        </div>
    );
};

export default BoardGrid;