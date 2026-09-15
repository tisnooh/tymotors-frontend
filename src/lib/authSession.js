let accessToken = null;

export function setCachedAccessToken(token) {
  accessToken = token || null;
}

export function getCachedAccessToken() {
  return accessToken;
}
