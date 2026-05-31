import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

export function useSocket(onSlotUpdate) {
  const handlerRef = useRef(onSlotUpdate);
  handlerRef.current = onSlotUpdate;

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(window.location.origin, { path: '/socket.io' });
    }
    const handler = data => handlerRef.current?.(data);
    socketInstance.on('slot-update', handler);
    return () => socketInstance.off('slot-update', handler);
  }, []);
}
