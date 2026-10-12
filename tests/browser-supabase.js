export const getCachedAccessToken=()=>window.__fixtureRole===null?null:(window.__fixtureRole||'admin')+'-test-token';
export const getAccessToken=async()=>getCachedAccessToken();
