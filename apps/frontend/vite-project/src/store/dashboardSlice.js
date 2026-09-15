import { createSlice } from '@reduxjs/toolkit';

// ─── Slice ───────────────────────────────────────────────────────────────────
// Only plain actions + reducers here.
// All async API calls live in the components that need them.

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        orgs: [],
        selectedOrgId: null,
        boards: [],
        userRole: null,
        loading: {
            orgs: false,
            boards: false,
        },
        error: {
            orgs: null,
            boards: null,
        },
    },
    reducers: {

        // ── Orgs ──────────────────────────────────────────────────────────────

        // Called before the fetch orgs API request starts — show a spinner.
        setOrgsLoading(state) {
            state.loading.orgs = true;
            state.error.orgs = null;
        },

        // Called when orgs are fetched successfully — store them and pick the active org.
        setOrgs(state, action) {
            state.loading.orgs = false;
            state.orgs = action.payload;

            // Restore the last active org the user visited; fall back to the first org.
            const lastActiveOrgId = localStorage.getItem('lastActiveOrgId');
            const exists = action.payload.some(
                (o) => String(o.orgId) === lastActiveOrgId
            );
            state.selectedOrgId = exists
                ? lastActiveOrgId
                : action.payload[0]?.orgId ?? null;
        },

        // Called when the fetch orgs API request fails — store the error message.
        setOrgsError(state, action) {
            state.loading.orgs = false;
            state.error.orgs = action.payload;
        },

        // ── Boards ────────────────────────────────────────────────────────────

        // Called before the fetch boards API request starts — clear stale boards and show a spinner.
        setBoardsLoading(state) {
            state.loading.boards = true;
            state.error.boards = null;
            state.boards = [];
        },

        // Called when boards are fetched successfully — store them and the user's role.
        setBoards(state, action) {
            state.loading.boards = false;
            state.boards = action.payload.boards;
            state.userRole = action.payload.role;
        },

        // Called when the fetch boards API request fails — store the error message.
        setBoardsError(state, action) {
            state.loading.boards = false;
            state.error.boards = action.payload;
        },

        // Called after a board is created successfully — append it to the list.
        addBoard(state, action) {
            state.boards.push(action.payload);
        },

        // ── Org Selection ─────────────────────────────────────────────────────

        // Called when the user switches the active org — persist the choice to localStorage.
        setSelectedOrg(state, action) {
            state.selectedOrgId = action.payload;
            localStorage.setItem('lastActiveOrgId', action.payload);
        },

        // Called when a board action fails — store the error message.
        setBoardsActionError(state, action) {
            state.error.boards = action.payload;
        },

        // Called when modal is closed — clear any stale error.
        clearBoardsActionError(state) {
            state.error.boards = null;
        },
    },
});

export const {
    setOrgsLoading,
    setOrgs,
    setOrgsError,
    setBoardsLoading,
    setBoards,
    setBoardsError,
    addBoard,
    setSelectedOrg,
    setBoardsActionError,
    clearBoardsActionError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
