import { useEffect, useRef, useState } from "react";

export type UseDelayedLoadingResultProps = {
  session: unknown;
  asyncOperationIsPending: boolean;
  asyncOperationIsComplete: boolean;
  delay?: number;
};

export const useDelayedLoading = ({
  session,
  asyncOperationIsPending,
  asyncOperationIsComplete,
  delay = 1000,
}: UseDelayedLoadingResultProps): boolean => {
  const [delayedLoading, setDelayedLoading] = useState(false);
  const [delayedLoadingDone, setDelayedLoadingDone] = useState(false);

  console.log("-----------------------------------------------");
  console.log("session = ", session);
  console.log("delayedLoading = ", delayedLoading);
  console.log("delayedLoadingDone = ", delayedLoadingDone);
  console.log("asyncOperationIsPending prop = ", asyncOperationIsPending);
  console.log("asyncOperationIsCompleted prop = ", asyncOperationIsComplete);

  const outerTimeoutId = useRef<number | undefined>();

  useEffect(() => {
    console.log("useDelayedLoading useEffect");
    let innerTimeoutId: number | undefined;

    setDelayedLoading(false);
    setDelayedLoadingDone(false);

    outerTimeoutId.current = window.setTimeout(() => {
      console.log("outer timeout elapsed, displaying loading state for 500ms");
      setDelayedLoading(true);
      innerTimeoutId = window.setTimeout(() => {
        console.log("inner timeout elapsed");
        setDelayedLoadingDone(true);
      }, 1000);
    }, delay);

    return () => {
      console.log(`clear timeouts, outerTimeout = ${outerTimeoutId}, innerTimeout = ${innerTimeoutId}`);
      clearTimeout(outerTimeoutId.current);
      clearTimeout(innerTimeoutId);
    };
  }, [delay, session]);

  //return loading false if time to show loading status has not elapsed yet
  if (!delayedLoading) {
    console.log("return delayedLoading = false");

    // if async operation is complete clear delayed loading timeout
    if (asyncOperationIsComplete) {
      console.log("clear timeout because async operation is done");
      clearTimeout(outerTimeoutId.current);
    }
    return false;
  }
  // time to wait to show loading status has elapsed
  else {
    // return loading true for a specific time(500ms by default) or until the async operation is pending
    if (!delayedLoadingDone || asyncOperationIsPending) {
      console.log(`return delayedLoading = true`);
      return true;
    }

    // return loading false because async operation is completed or minimum time to show loading status
    // has elapsed
    console.log(
      "async operation is completed or time to show loading status has elapsed, return delayedLoading = false"
    );
    return false;
  }
};
