import { useEffect, useRef, useState } from "react";

export type UseDelayedLoadingResultProps = {
  session: unknown;
  asyncOperationIsCompleted: boolean;
  delay?: number;
  loadingStateMinimumTime?: number;
};

export const useDelayedLoading = ({
  session,
  asyncOperationIsCompleted,
  delay = 300,
  loadingStateMinimumTime = 300,
}: UseDelayedLoadingResultProps): boolean => {
  const [delayedLoading, setDelayedLoading] = useState(false);
  const [delayedLoadingDone, setDelayedLoadingDone] = useState(false);

  const outerTimeoutIdRef = useRef<number>(undefined);
  const sessionRef = useRef(session);

  // initiate timeout to delay loading state
  useEffect(() => {
    let innerTimeoutId: number | undefined;

    // reset state when session changes
    if (sessionRef.current !== session) {
      sessionRef.current = session;
      setDelayedLoading(false);
      setDelayedLoadingDone(false);
    }

    outerTimeoutIdRef.current = window.setTimeout(() => {
      setDelayedLoading(true);
      innerTimeoutId = window.setTimeout(() => {
        setDelayedLoadingDone(true);
        setDelayedLoading(false);
      }, loadingStateMinimumTime);
    }, delay);

    return () => {
      clearTimeout(outerTimeoutIdRef.current);
      clearTimeout(innerTimeoutId);
    };
  }, [delay, session, loadingStateMinimumTime]);

  // when async operation is completed, change state to signalize that loading is done
  useEffect(() => {
    if (asyncOperationIsCompleted && delayedLoadingDone) {
      setDelayedLoadingDone(false);
    }
  }, [asyncOperationIsCompleted, delayedLoadingDone]);

  if (!delayedLoading && !delayedLoadingDone && asyncOperationIsCompleted) {
    clearTimeout(outerTimeoutIdRef.current);
  }

  return sessionRef.current === session && (delayedLoading || delayedLoadingDone);
};
