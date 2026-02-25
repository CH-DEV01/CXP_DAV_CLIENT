import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export function useSessionTimer(loginTimeMs, sessionDurationMs = 5 * 60_000, warningBeforeMs = 15_000) {
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        if (!loginTimeMs) return;

        const expireAt = loginTimeMs + sessionDurationMs;
        const warningAt = expireAt - warningBeforeMs;
        const now = Date.now();

        const msToWarning = warningAt - now;
        const msToExpire = expireAt - now;

        let warnTimer, expireTimer;

        if (msToWarning > 0) {
            warnTimer = setTimeout(() => setShowWarning(true), msToWarning);
        } else {
            setShowWarning(true);
        }

        if (msToExpire > 0) {
            expireTimer = setTimeout(() => {
                window.location.reload(); // aca vamos a borrar el session storage
            }, msToExpire);
        } else {
            window.location.reload(); // aca tambien
        }

        return () => {
            clearTimeout(warnTimer);
            clearTimeout(expireTimer);
        };
    }, [loginTimeMs, sessionDurationMs, warningBeforeMs]);

    return showWarning;
}
