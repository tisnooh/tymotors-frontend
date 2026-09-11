export const getAccessToken=async()=>window.__fixtureRole===null?null:(window.__fixtureRole||'admin')+'-test-token';
