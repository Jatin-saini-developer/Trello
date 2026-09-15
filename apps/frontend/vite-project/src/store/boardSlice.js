import { createSlice } from '@reduxjs/toolkit';

// ─── Slice ───────────────────────────────────────────────────────────────────
// Only plain actions + reducers here.
// All async API calls live in the components that need them.

const boardSlice = createSlice({
    name: 'board',
    initialState: {
        sections: [],
        issues: [],
        loading: {
            sections: false,
            issues: false,
        },
        error: {
            sections: null,
            issues: null,
        },
    },
    reducers: {

        // ── Sections ──────────────────────────────────────────────────────────

        // Called before the fetch sections API request starts — show a spinner.
        setSectionsLoading(state) {
            state.loading.sections = true;
            state.error.sections = null;
        },

        // Called when sections are fetched successfully — store them.
        setSections(state, action) {
            state.loading.sections = false;
            state.sections = action.payload;
        },

        addSection(state, action) {
            state.sections.push(action.payload);
        },

        // Called when the fetch sections API request fails — store the error message.
        setSectionsError(state, action) {
            state.loading.sections = false;
            state.error.sections = action.payload;
        },

        // ── Issues ────────────────────────────────────────────────────────────

        // Called before the fetch issues API request starts — show a spinner.
        setIssuesLoading(state) {
            state.loading.issues = true;
            state.error.issues = null;
        },

        // Called when issues are fetched successfully — store them.
        setIssues(state, action) {
            state.loading.issues = false;
            state.issues = action.payload;
        },

        // Called when the fetch issues API request fails — store the error message.
        setIssuesError(state, action) {
            state.loading.issues = false;
            state.error.issues = action.payload;
        },
    },
});

export const {
    setSectionsLoading,
    setSections,
    addSection,
    setSectionsError,
    setIssuesLoading,
    setIssues,
    setIssuesError,
} = boardSlice.actions;

export default boardSlice.reducer;
