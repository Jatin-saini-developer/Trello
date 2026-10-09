// Shared by the dashboard, the org switcher and the Create Organisation preview,
// so an organisation always gets the same colour and initials.
const TILES = ['#D97757', '#6FB38E', '#9C8FE0', '#E9A23B', '#5FA8D3'];

export const tileColor = (s = '') =>
    TILES[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % TILES.length];

export const initials = (s = '') => {
    const w = s.split(/\s+/).filter(Boolean);
    return (w.length > 1 ? w[0][0] + w[1][0] : s.slice(0, 2)).toUpperCase();
};