import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// A subtle set of gradient pairs to make board cards visually distinct
const BOARD_GRADIENTS = [
    'from-[#D97757]/20 to-[#F5C4AE]/20',
    'from-[#7B9FD4]/20 to-[#B8D0EE]/20',
    'from-[#7DBF9E]/20 to-[#B8DFCA]/20',
    'from-[#B57FD4]/20 to-[#D9B8EE]/20',
    'from-[#D4A57F]/20 to-[#EED5B8]/20',
    'from-[#7FC8D4]/20 to-[#B8E3EE]/20',
];

const BoardCard = ({ board, index }) => {
    const navigate = useNavigate();
    const { selectedOrgId } = useSelector((s) => s.dashboard);
    const gradient = BOARD_GRADIENTS[index % BOARD_GRADIENTS.length];

    return (
        <button
            onClick={() => navigate(`/org/${selectedOrgId}/board/${board._id}`)}
            className={`
                group relative w-full text-left
                bg-gradient-to-br ${gradient}
                border border-[#E8E4DC] hover:border-[#D97757]/40
                rounded-2xl p-5
                transition-all duration-200
                hover:shadow-md hover:-translate-y-0.5
                active:translate-y-0 active:shadow-sm
                cursor-pointer
            `}
        >
            {/* Board title */}
            <h3 className="text-[15px] font-semibold text-[#1A1A1A] leading-snug group-hover:text-[#D97757] transition-colors duration-150">
                {board.title}
            </h3>

            {/* Open arrow — appears on hover */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 12L12 4M12 4H7M12 4V9" stroke="#D97757" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </button>
    );
};

export default BoardCard;
