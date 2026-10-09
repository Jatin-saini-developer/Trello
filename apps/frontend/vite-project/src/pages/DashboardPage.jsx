import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import gsap from 'gsap';
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
import { tileColor, initials } from '../utils/orgTile.js';

const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

const ICONS = {
    Boards: <path d="M2.5 2.5h4.5v6h-4.5zM9 2.5h4.5v3.5H9zM9 8h4.5v5.5H9zM2.5 10.5h4.5v3h-4.5z" />,
    Members: <><circle cx="6" cy="5.5" r="2.3" /><path d="M1.5 13.5c0-2.4 1.9-3.8 4.5-3.8s4.5 1.4 4.5 3.8" /><circle cx="11.6" cy="6.3" r="1.8" /><path d="M11.8 10c1.7 0 2.7 1 2.7 3" /></>,
    Settings: <><circle cx="8" cy="8" r="2.2" /><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" /></>,
};

const DashboardPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const root = useRef(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
    };

    const { selectedOrgId, orgs, userRole, loading, boards } = useSelector(
        (s) => s.dashboard
    );

    // Entrance: sidebar slides in, header settles, board panel rises
    useLayoutEffect(() => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const ctx = gsap.context(() => {
            gsap.from('[data-in="side"]', { x: -36, opacity: 0, duration: 0.9, ease: 'power3.out' });
            gsap.from('[data-in="head"] > *', { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, delay: 0.15, ease: 'power3.out' });
            gsap.from('[data-in="grid"]', { y: 36, opacity: 0, duration: 0.9, delay: 0.3, ease: 'power3.out' });
        }, root);
        return () => ctx.revert();
    }, []);

    // On mount — fetch the user's organizations from the API.
    useEffect(() => {
        const fetchOrgs = async () => {
            dispatch(setOrgsLoading());
            try {
                const token = localStorage.getItem('token');
                const { data } = await api.get(
                    '/dashboard/me/organizations',
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
    const count = Array.isArray(boards) ? boards.length : null;

    return (
        <div ref={root} className="relative flex min-h-screen flex-col bg-[#F4EFE5] font-sans text-[#1B1A17] lg:flex-row">

            {/* Soft colour blobs behind everything */}
            <i className="pointer-events-none fixed -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-[#ffd6c0] opacity-75 blur-[90px]" />
            <i className="pointer-events-none fixed -bottom-52 -right-40 h-[560px] w-[560px] rounded-full bg-[#d2e6d3] opacity-75 blur-[90px]" />

            {/* ── Sidebar ─────────────────────────────────────── */}
            <aside
                data-in="side"
                className="relative z-10 flex shrink-0 flex-col gap-5 border-b border-[#E4DDCD] bg-white/70 p-5 backdrop-blur-md lg:sticky lg:top-3 lg:m-3 lg:h-[calc(100vh-1.5rem)] lg:w-64 lg:self-start lg:rounded-3xl lg:border lg:shadow-[0_30px_60px_-30px_rgba(70,45,10,0.4)]"
            >
                {/* Brand */}
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#D97757]">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
                            <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                            <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                            <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
                        </svg>
                    </div>
                    <span className="text-[15px] font-bold tracking-tight">Trello</span>
                </div>

                {/* Org switcher */}
                <OrgSwitcher />

                <div className="hidden h-px bg-[#E4DDCD] lg:block" />

                {/* Nav items placeholder */}
                <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                    <span className="mb-1 hidden px-2 text-xs font-medium text-[#7A756B] lg:block">Views</span>
                    {['Boards', 'Members', 'Settings'].map((item) => (
                        <button
                            key={item}
                            type="button"
                            aria-current={item === 'Boards' ? 'page' : undefined}
                            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200
                                ${item === 'Boards'
                                    ? 'bg-[#1B1A17] text-white shadow-md'
                                    : 'text-[#7A756B] hover:translate-x-0.5 hover:bg-white hover:text-[#1B1A17]'}
                            `}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                                {ICONS[item]}
                            </svg>
                            {item}
                        </button>
                    ))}
                </nav>

                {/* Logout — pinned to bottom */}
                <div className="lg:mt-auto">
                    <div className="mb-3 hidden h-px bg-[#E4DDCD] lg:block" />
                    <button
                        id="sidebar-logout-btn"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-[#7A756B] transition-colors duration-150 hover:bg-[#fdeee6] hover:text-[#b3411f]"
                    >
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                            <path d="M6 2H3a1 1 0 00-1 1v9a1 1 0 001 1h3"
                                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                            <path d="M10 10l3-3-3-3"
                                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M13 7H6"
                                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                        Log out
                    </button>
                </div>
            </aside>

            {/* ── Main area ───────────────────────────────────── */}
            <main className="relative z-10 flex min-w-0 flex-1 flex-col gap-8 px-5 py-8 lg:px-10 lg:py-10">

                {/* Header */}
                <div data-in="head" className="flex flex-wrap items-end justify-between gap-6">
                    <div className="flex items-center gap-5">
                        {loading.orgs ? (
                            <>
                                <div className="h-16 w-16 animate-pulse rounded-2xl bg-[#ece5d6]" />
                                <div className="space-y-3">
                                    <div className="h-4 w-24 animate-pulse rounded bg-[#ece5d6]" />
                                    <div className="h-12 w-64 animate-pulse rounded-lg bg-[#ece5d6]" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div
                                    className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-2xl font-bold text-white shadow-[0_14px_24px_-12px_rgba(70,45,10,0.55)]"
                                    style={{ background: activeOrg ? tileColor(activeOrg.name) : '#e3dac7' }}
                                >
                                    {activeOrg ? initials(activeOrg.name) : ''}
                                </div>
                                <div>
                                    <p className="mb-1 text-sm font-medium text-[#C4603F]">{greeting()}</p>
                                    <h1 className="font-serif text-5xl leading-none tracking-tight lg:text-6xl">
                                        {activeOrg?.name ?? 'Dashboard'}
                                    </h1>
                                    <div className="mt-3 flex items-center gap-3">
                                        {userRole && (
                                            <span className="rounded-md bg-[#fde6dc] px-2.5 py-1 text-xs font-bold capitalize text-[#C4603F]">
                                                {userRole}
                                            </span>
                                        )}
                                        {count !== null && (
                                            <span className="text-sm text-[#7A756B]">
                                                {count} {count === 1 ? 'board' : 'boards'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="group relative isolate flex items-center gap-2 overflow-hidden rounded-xl bg-[#D97757] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_20px_-10px_rgba(217,119,87,0.9)] transition-shadow hover:shadow-[0_14px_26px_-10px_rgba(27,26,23,0.5)]"
                    >
                        <span className="absolute inset-0 -z-10 translate-y-full bg-[#1B1A17] transition-transform duration-500 ease-out group-hover:translate-y-0" />
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <path d="M6.5 1v11M1 6.5h11" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        New Board
                    </button>
                </div>

                {/* Board grid */}
                <section data-in="grid" className="rounded-3xl border border-[#E4DDCD] bg-white/50 p-4 backdrop-blur-sm sm:p-6">
                    <BoardGrid onCreateBoard={() => setShowCreateModal(true)} />
                </section>
            </main>

            {/* Create Board Modal */}
            {showCreateModal && (
                <CreateBoardModal onClose={() => setShowCreateModal(false)} />
            )}
        </div>
    );
};

export default DashboardPage;