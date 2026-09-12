import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    setOrgsLoading,
    setOrgs,
    setOrgsError,
    setBoardsLoading,
    setBoards,
    setBoardsError,
} from '../store/dashboardSlice.js';
import api from '../utils/api.js';
import OrgSwitcher from '../components/dashboard/OrgSwitcher.jsx';
import BoardGrid from '../components/dashboard/BoardGrid.jsx';
import CreateBoardModal from '../components/dashboard/CreateBoardModal.jsx';

const DashboardPage = () => {
    const dispatch = useDispatch();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { selectedOrgId, orgs, userRole, loading } = useSelector(
        (s) => s.dashboard
    );

    // On mount — fetch the user's organizations from the API.
    useEffect(() => {
        const fetchOrgs = async () => {
            dispatch(setOrgsLoading());
            try {
                const token = localStorage.getItem('token');
                const { data } = await api.post(
                    '/dashboard/me/organizations',
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                dispatch(setOrgs(data.orgs)); // [{ orgId, name, description, role }]
            } catch (err) {
                dispatch(setOrgsError(
                    err.response?.data?.error || 'Failed to fetch organizations'
                ));
            }
        };

        fetchOrgs();
    }, [dispatch]);

    // Whenever the active org changes — fetch the boards that belong to it.
    useEffect(() => {
        if (!selectedOrgId) return;

        const fetchBoards = async () => {
            dispatch(setBoardsLoading());
            try {
                const token = localStorage.getItem('token');
                const { data } = await api.get(
                    `/dashboard/organizations/${selectedOrgId}/boards`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                dispatch(setBoards({ boards: data.boards, role: data.role }));
            } catch (err) {
                dispatch(setBoardsError(
                    err.response?.data?.error || 'Failed to fetch boards'
                ));
            }
        };

        fetchBoards();
    }, [selectedOrgId, dispatch]);

    // Derive the active org name for the header.
    const activeOrg = orgs.find((o) => String(o.orgId) === String(selectedOrgId));

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex font-sans">

            {/* ── Sidebar ─────────────────────────────────────── */}
            <aside className="w-64 shrink-0 bg-white border-r border-[#E8E4DC] flex flex-col px-5 py-6 gap-6">

                {/* Brand */}
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#D97757] flex items-center justify-center shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
                            <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                            <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                            <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
                        </svg>
                    </div>
                    <span className="text-[15px] font-semibold text-[#1A1A1A] tracking-tight">
                        Trello
                    </span>
                </div>

                {/* Org switcher */}
                <OrgSwitcher />

                {/* Divider */}
                <div className="h-px bg-[#ECEAE4]" />

                {/* Nav items placeholder */}
                <nav className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-[#9B9590] uppercase tracking-widest mb-1 px-2">
                        Views
                    </span>
                    {['Boards', 'Members', 'Settings'].map((item) => (
                        <button
                            key={item}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150 text-left
                                ${item === 'Boards'
                                    ? 'bg-[#FEF3EE] text-[#D97757]'
                                    : 'text-[#7A7672] hover:bg-[#F7F4F0] hover:text-[#1A1A1A]'}
                            `}
                        >
                            {item}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* ── Main area ───────────────────────────────────── */}
            <main className="flex-1 flex flex-col px-8 py-8 min-w-0">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        {loading.orgs ? (
                            <div className="h-7 w-40 rounded-lg bg-[#F0EDE6] animate-pulse" />
                        ) : (
                            <h1 className="text-[22px] font-semibold text-[#1A1A1A] tracking-tight">
                                {activeOrg?.name ?? 'Dashboard'}
                            </h1>
                        )}
                        {userRole && (
                            <span className="inline-block mt-1 text-[11px] font-semibold text-[#9B9590] uppercase tracking-widest">
                                {userRole}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D97757] hover:bg-[#C96A49] active:bg-[#B85E3E] text-white text-sm font-semibold transition-all duration-150 shadow-sm hover:shadow-md"
                    >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <path d="M6.5 1v11M1 6.5h11" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        New Board
                    </button>
                </div>

                {/* Board grid */}
                <BoardGrid onCreateBoard={() => setShowCreateModal(true)} />
            </main>

            {/* Create Board Modal */}
            {showCreateModal && (
                <CreateBoardModal onClose={() => setShowCreateModal(false)} />
            )}
        </div>
    );
};

export default DashboardPage;
