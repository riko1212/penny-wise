import { useState } from 'react';
import type { User } from '../types';

export function useCurrentUser(): User | null {
  const [user] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('loggedInUser') ?? 'null') as User | null; } catch { return null; }
  });
  return user;
}
