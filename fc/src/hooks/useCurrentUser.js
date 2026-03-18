import { useState } from 'react';

export function useCurrentUser() {
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem('loggedInUser')); } catch { return null; }
  });
  return user;
}
