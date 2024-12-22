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
  delay = 1000,
  loadingStateMinimumTime = 1000,
}: UseDelayedLoadingResultProps): boolean => {
  const [delayedLoading, setDelayedLoading] = useState(false);
  const [delayedLoadingDone, setDelayedLoadingDone] = useState(false);

  console.log("-----------------------------------------------");
  console.log("session = ", session);
  console.log("delayedLoading = ", delayedLoading);
  console.log("delayedLoadingDone = ", delayedLoadingDone);
  console.log("asyncOperationIsCompleted prop = ", asyncOperationIsCompleted);

  const outerTimeoutId = useRef<number>(undefined);

  useEffect(() => {
    console.log("USE_DELAYED_LOADING USE_EFFECT");
    let innerTimeoutId: number | undefined;

    setDelayedLoadingDone(false);

    outerTimeoutId.current = window.setTimeout(() => {
      console.log("outer timeout elapsed, displaying loading state for 500ms");
      setDelayedLoading(true);
      innerTimeoutId = window.setTimeout(() => {
        console.log("inner timeout elapsed");
        setDelayedLoadingDone(true);
        setDelayedLoading(false);
      }, loadingStateMinimumTime);
    }, delay);

    return () => {
      console.log(
        `clear timeouts, outerTimeout = ${outerTimeoutId.current}, innerTimeout = ${innerTimeoutId}`
      );
      clearTimeout(outerTimeoutId.current);
      clearTimeout(innerTimeoutId);
    };
  }, [delay, session, loadingStateMinimumTime]);

  if (!delayedLoading) {
    if (!delayedLoadingDone) {
      if (asyncOperationIsCompleted) {
        // clear delayed loading timeout if async operation is complete
        // before delay time to be in the loading state has elapsed
        console.log("clear timeout because async operation is done");
        clearTimeout(outerTimeoutId.current);
      }
      console.log("delay time to be in the loading state has not elapsed yet, return FALSE");
      return false;
    }
    if (asyncOperationIsCompleted) {
      console.log(
        `async operation is completed and minimum time to be in the loading state has already elapsed, return FALSE`
      );
      setDelayedLoadingDone(false);
      return false;
    }
    // return TRUE if async operation is still not completed
    // (minimum time to be in the loading state has already elapsed)
    console.log(
      `async operation is still not complete, but minimum time to be in the loading state has already elapsed return TRUE`
    );
    return true;
  }
  // return TRUE because an async operation was not complete in time specified by the `delay` prop(default is 300ms)
  // and therefore loading state is TRUE for `loadingStateMinimumTime` time
  console.log(
    `an async operation was not complete in time and loading state will be true for a minimum time, return TRUE`
  );
  return true;
};
