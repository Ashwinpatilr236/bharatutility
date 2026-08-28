import { useState, useEffect } from 'react';
import { adminStore } from '../services/adminStore';

/**
 * Custom React hook that subscribes components to adminStore state changes.
 * Whenever Supabase sync or adminStore updates occur, components using this hook automatically re-render.
 */
export function useAdminStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = adminStore.subscribe(() => {
      setTick(prev => prev + 1);
    });
    return () => unsubscribe();
  }, []);

  return adminStore;
}
