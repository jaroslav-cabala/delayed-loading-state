import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDelayedLoading, UseDelayedLoadingResultProps } from "./useDelayedLoadingState";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDelayedLoadingState hook", () => {
  describe(`with default delay to return loading state - 1000ms
            and default "minimum time to be in the loading state" - 1000ms`, () => {
    test("when async operation completed within 1000ms, returns FALSE", async () => {
      const { result, rerender } = renderHook(
        (props: UseDelayedLoadingResultProps) => useDelayedLoading(props),
        {
          initialProps: {
            session: 1,
            ...notPendingNotCompletedAsyncOperationArgs,
          },
        }
      );
      expect(result.current).toBe(false);

      // async operation is pending after total of 400ms
      vi.advanceTimersByTime(400);
      rerender({ session: 1, ...pendingNotCompletedAsyncOperationArgs });
      expect(result.current).toBe(false);

      // async operation is completed after total of 800ms
      vi.advanceTimersByTime(400);
      rerender({ session: 1, ...notPendingCompletedAsyncOperationArgs });
      expect(result.current).toBe(false);
    });

    test(`when async operation completed after 1000ms,
          but before the "minimum time to be in the loading state" elapsed,
          returns FALSE for 1000ms, then TRUE for 1000ms and then FALSE`, async () => {
      const { result, rerender } = renderHook(
        (props: UseDelayedLoadingResultProps) => useDelayedLoading(props),
        {
          initialProps: {
            session: 1,
            ...notPendingNotCompletedAsyncOperationArgs,
          },
        }
      );
      expect(result.current).toBe(false);

      // async operation is pending after total of 400ms
      vi.advanceTimersByTime(400);
      rerender({ session: 1, ...pendingNotCompletedAsyncOperationArgs });
      expect(result.current).toBe(false);

      // async operation is completed after total of 1100ms
      vi.advanceTimersByTime(700);
      rerender({ session: 1, ...notPendingCompletedAsyncOperationArgs });
      // hook returns TRUE after total of 1990ms because of the minimum time to be in the loading state
      vi.advanceTimersByTime(890);
      expect(result.current).toBe(true);

      // hook returns FALSE after total of 2010ms because the minimum time to be in the loading state elapsed
      vi.advanceTimersByTime(20);
      rerender({ session: 1, ...notPendingCompletedAsyncOperationArgs });
      expect(result.current).toBe(false);
    });

    test(`when async operation completed after 1000ms and also after the
          "minimum time to be in the loading state" elapsed,
          returns FALSE for 1000ms, then TRUE while async operation is pending
          and then FALSE when the async operation is completed`, async () => {
      const { result, rerender } = renderHook(
        (props: UseDelayedLoadingResultProps) => useDelayedLoading(props),
        {
          initialProps: {
            session: 1,
            ...notPendingNotCompletedAsyncOperationArgs,
          },
        }
      );
      expect(result.current).toBe(false);

      // async operation is pending after total of 400ms
      vi.advanceTimersByTime(400);
      rerender({ session: 1, ...pendingNotCompletedAsyncOperationArgs });
      expect(result.current).toBe(false);

      // async operation is pending after total of 1000ms
      vi.advanceTimersByTime(600);
      rerender({ session: 1, ...pendingNotCompletedAsyncOperationArgs });
      expect(result.current).toBe(true);

      // async operation is pending after total of 2010ms
      vi.advanceTimersByTime(1010);
      rerender({ session: 1, ...pendingNotCompletedAsyncOperationArgs });
      expect(result.current).toBe(true);

      // async operation is completed after total of 2020ms
      vi.advanceTimersByTime(10);
      rerender({ session: 1, ...notPendingCompletedAsyncOperationArgs });
      expect(result.current).toBe(false);
    });
  });

  // test case to verify correct state when changing session
});

const notPendingNotCompletedAsyncOperationArgs: Pick<
  UseDelayedLoadingResultProps,
  "asyncOperationIsCompleted" | "asyncOperationIsPending"
> = { asyncOperationIsCompleted: false, asyncOperationIsPending: false };

const pendingNotCompletedAsyncOperationArgs: Pick<
  UseDelayedLoadingResultProps,
  "asyncOperationIsCompleted" | "asyncOperationIsPending"
> = { asyncOperationIsCompleted: false, asyncOperationIsPending: true };

const notPendingCompletedAsyncOperationArgs: Pick<
  UseDelayedLoadingResultProps,
  "asyncOperationIsCompleted" | "asyncOperationIsPending"
> = { asyncOperationIsCompleted: true, asyncOperationIsPending: false };
