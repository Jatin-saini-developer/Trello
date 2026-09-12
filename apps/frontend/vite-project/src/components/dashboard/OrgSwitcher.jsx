import { useDispatch, useSelector } from 'react-redux';
import {
    setSelectedOrg,
    setBoardsLoading,
    setBoards,
    setBoardsError,
} from '../../store/dashboardSlice.js';
import api from '../../utils/api.js';

const OrgSwitcher = () => {
    const dispatch = useDispatch();
    const { orgs, selectedOrgId, loading } = useSelector((s) => s.dashboard);

    // When the user picks a different org — update the selection and fetch its boards.
    const handleChange = async (e) => {
        const orgId = e.target.value;

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

    if (loading.orgs) {
        return (
            <div className="h-9 rounded-xl bg-[#F0EDE6] animate-pulse" />
        );
    }

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-[#9B9590] uppercase tracking-widest px-1">
                Workspace
            </span>
            <div className="relative">
                <select
                    value={selectedOrgId ?? ''}
                    onChange={handleChange}
                    className="w-full appearance-none px-3 py-2 pr-8 rounded-xl border border-[#E0DDD6] bg-white text-[#1A1A1A] text-sm font-medium outline-none cursor-pointer transition-all duration-150 focus:border-[#D97757] focus:ring-2 focus:ring-[#D97757]/15 hover:border-[#C9C5BE]"
                >
                    {orgs.map((org) => (
                        <option key={org.orgId} value={org.orgId}>
                            {org.name}
                        </option>
                    ))}
                </select>
                {/* chevron icon */}
                <svg
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9B9590]"
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                >
                    <path d="M3.5 5.25l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
};

export default OrgSwitcher;
