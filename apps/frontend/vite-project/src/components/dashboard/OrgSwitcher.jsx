import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    setSelectedOrg,
    setBoardsLoading,
    setBoards,
    setBoardsError,
} from '../../store/dashboardSlice.js';
import api from '../../utils/api.js';
import { tileColor, initials } from '../../utils/orgTile.js';

const OrgSwitcher = () => {
    const dispatch = useDispatch();
    const { orgs, selectedOrgId, loading } = useSelector((s) => s.dashboard);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const box = useRef(null);

    const current = orgs.find((o) => String(o.orgId) === String(selectedOrgId));

    // When the user picks a different org — update the selection and fetch its boards.
    const select = async (orgId) => {
        // 1. Update the selected org in Redux (also persists to localStorage).
        dispatch(setSelectedOrg(orgId));

        // 2. Fetch the boards for the newly selected org.
        dispatch(setBoardsLoading());
        try {
            const token = localStorage.getItem('token');
            const { data } = await api.get(
                `/dashboard/organizations/${orgId}/boards`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            dispatch(setBoards({ boards: data.boards, role: data.role }));
        } catch (err) {
            dispatch(setBoardsError(
                err.response?.data?.error || 'Failed to fetch boards'
            ));
        }
    };

    const pick = (org) => {
        setOpen(false);
        if (String(org.orgId) !== String(selectedOrgId)) select(String(org.orgId));
    };

    const toggle = () => {
        setActive(Math.max(0, orgs.findIndex((o) => String(o.orgId) === String(selectedOrgId))));
        setOpen((o) => !o);
    };

    // Close when clicking anywhere outside
    useEffect(() => {
        if (!open) return;
        const away = (e) => { if (!box.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('pointerdown', away);
        return () => document.removeEventListener('pointerdown', away);
    }, [open]);

    // Keyboard: arrows move, Enter/Space picks, Escape closes
    const onKey = (e) => {
        if (e.key === 'Escape' && open) { setOpen(false); return; }
        if (!open) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); toggle(); }
            return;
        }
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(orgs.length - 1, i + 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); orgs[active] && pick(orgs[active]); }
        else if (e.key === 'Tab') setOpen(false);
    };

    if (loading.orgs) {
        return (
            <div className="h-[52px] animate-pulse rounded-2xl bg-[#ece5d6]" />
        );
    }

    return (
        <div className="flex flex-col gap-1.5" ref={box}>
            <span className="px-1 text-xs font-medium text-[#7A756B]">Workspace</span>
            <div className="relative">
                <button
                    type="button"
                    onClick={toggle}
                    onKeyDown={onKey}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-controls="org-list"
                    aria-activedescendant={open && orgs[active] ? `org-opt-${orgs[active].orgId}` : undefined}
                    className="flex w-full items-center gap-3 rounded-2xl border border-[#E4DDCD] bg-white p-2 pr-3 text-left shadow-[0_8px_18px_-12px_rgba(70,45,10,0.4)] outline-none transition-all duration-150 hover:border-[#d6cdb8] focus-visible:ring-2 focus-visible:ring-[#D97757]/30"
                >
                    <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[13px] font-bold text-white transition-colors duration-300"
                        style={{ background: current ? tileColor(current.name) : '#e3dac7' }}
                    >
                        {current ? initials(current.name) : ''}
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold leading-tight">
                            {current?.name ?? 'No workspace'}
                        </span>
                        {current?.role && (
                            <span className="block text-[11px] capitalize text-[#7A756B]">{current.role}</span>
                        )}
                    </span>
                    {/* chevron icon */}
                    <svg
                        className={`shrink-0 text-[#7A756B] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                        width="14" height="14" viewBox="0 0 14 14" fill="none"
                    >
                        <path d="M3.5 5.25l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <ul
                    id="org-list"
                    role="listbox"
                    className={`absolute left-0 right-0 top-full z-30 mt-2 max-h-72 origin-top overflow-y-auto rounded-2xl border border-[#E4DDCD] bg-white p-1.5 shadow-[0_30px_60px_-24px_rgba(70,45,10,0.5)] transition-all duration-150
                        ${open ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0'}`}
                >
                    {orgs.map((org, i) => {
                        const selected = String(org.orgId) === String(selectedOrgId);
                        return (
                            <li
                                key={org.orgId}
                                id={`org-opt-${org.orgId}`}
                                role="option"
                                aria-selected={selected}
                                onMouseEnter={() => setActive(i)}
                                onClick={() => pick(org)}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-100 ${i === active ? 'bg-[#F4EFE5]' : ''}`}
                            >
                                <span
                                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold text-white"
                                    style={{ background: tileColor(org.name) }}
                                >
                                    {initials(org.name)}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium leading-tight">{org.name}</span>
                                    {org.role && <span className="block text-[11px] capitalize text-[#7A756B]">{org.role}</span>}
                                </span>
                                {selected && (
                                    <svg className="shrink-0 text-[#6FB38E]" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default OrgSwitcher;