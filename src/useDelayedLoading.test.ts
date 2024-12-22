import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDelayedLoading, UseDelayedLoadingResultProps } from "./useDelayedLoading";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDelayedLoadingState hook", () => {
  describe(`with default delay to return loading state - 300ms
    and default "minimum time to be in the loading state" - 300ms`, () => {
    test("when async operation completed within 300ms, returns FALSE", async () => {
      const { result, rerender } = renderHook(
        (props: UseDelayedLoadingResultProps) => useDelayedLoading(props),
        {
          initialProps: {
            session: 1,
            asyncOperationIsCompleted: false,
          },
        }
      );
      expect(result.current).toBe(false);

      // async operation is completed after total of 290ms
      vi.advanceTimersByTime(290);
      rerender({ session: 1, asyncOperationIsCompleted: true });
      expect(result.current).toBe(false);
    });

    test(`when async operation completed after 300ms,
      but before the "minimum time to be in the loading state" elapsed,
      returns FALSE for 300ms, then TRUE for 300ms and then FALSE`, async () => {
      const { result, rerender } = renderHook(
        (props: UseDelayedLoadingResultProps) => useDelayedLoading(props),
        {
          initialProps: {
            session: 1,
            asyncOperationIsCompleted: false,
          },
        }
      );
      expect(result.current).toBe(false);

      // async operation is completed after total of 310ms
      vi.advanceTimersByTime(310);
      rerender({ session: 1, asyncOperationIsCompleted: true });
      // hook returns TRUE after total of 590ms because of the minimum time to be in the loading state
      vi.advanceTimersByTime(280);
      rerender({ session: 1, asyncOperationIsCompleted: true });
      expect(result.current).toBe(true);

      // hook returns FALSE after total of 610ms because the minimum time to be in the loading state elapsed
      vi.advanceTimersByTime(20);
      rerender({ session: 1, asyncOperationIsCompleted: true });
      expect(result.current).toBe(false);
    });

    test(`when async operation completed after 300ms and also after the
      "minimum time to be in the loading state" elapsed,
      returns FALSE for 300ms, then TRUE while async operation is pending
      and then FALSE when the async operation is completed`, async () => {
      const { result, rerender } = renderHook(
        (props: UseDelayedLoadingResultProps) => useDelayedLoading(props),
        {
          initialProps: {
            session: 1,
            asyncOperationIsCompleted: false,
          },
        }
      );
      expect(result.current).toBe(false);

      // async operation is pending after total of 300ms
      vi.advanceTimersByTime(300);
      rerender({ session: 1, asyncOperationIsCompleted: false });
      expect(result.current).toBe(true);

      // async operation is pending after total of 610ms
      vi.advanceTimersByTime(310);
      rerender({ session: 1, asyncOperationIsCompleted: false });
      expect(result.current).toBe(true);

      // async operation is completed after total of 6220ms
      vi.advanceTimersByTime(10);
      rerender({ session: 1, asyncOperationIsCompleted: true });
      expect(result.current).toBe(false);
    });
  });

  test.only(`when session changes(new async op 2 is being executed) while async op 1 completed
    after 300ms default delay, loading state is true for the minimum default time of 300ms,
    state is reset and hook returns FALSE
    and then when the new async operation completes after 300ms, returns TRUE for 300ms and then FALSE`, () => {
    const { result, rerender } = renderHook(
      (props: UseDelayedLoadingResultProps) => useDelayedLoading(props),
      {
        initialProps: {
          session: 1,
          asyncOperationIsCompleted: false,
        },
      }
    );
    expect(result.current).toBe(false);

    // async operation is pending after total of 300ms
    vi.advanceTimersByTime(300);
    rerender({ session: 1, asyncOperationIsCompleted: true });
    expect(result.current).toBe(true);

    // change session when hook is in loading state, hook should reset the state and return false
    vi.advanceTimersByTime(100);
    rerender({ session: 2, asyncOperationIsCompleted: false });
    expect(result.current).toBe(false);

    // async operation is pending after total of 300ms
    vi.advanceTimersByTime(300);
    rerender({ session: 2, asyncOperationIsCompleted: false });
    expect(result.current).toBe(true);

    // async operation is completed after total of 310ms
    vi.advanceTimersByTime(10);
    rerender({ session: 2, asyncOperationIsCompleted: true });
    expect(result.current).toBe(true);

    // hook returns FALSE after total of 610ms because the minimum time to be in the loading state has elapsed
    vi.advanceTimersByTime(300);
    rerender({ session: 2, asyncOperationIsCompleted: true });
    expect(result.current).toBe(false);
  });

  test.only(`when session changes(new async op 2 is being executed) while async op 1 is still pending
    but loading state is false because minimum time to be in the loading state has elapsed,
    state is reset and hook returns FALSE,
    and then when the new async operation completes after 300ms, returns TRUE for 300ms and then FALSE`, () => {
    const { result, rerender } = renderHook(
      (props: UseDelayedLoadingResultProps) => useDelayedLoading(props),
      {
        initialProps: {
          session: 1,
          asyncOperationIsCompleted: false,
        },
      }
    );
    expect(result.current).toBe(false);

    // async operation is pending after total of 300ms
    vi.advanceTimersByTime(300);
    rerender({ session: 1, asyncOperationIsCompleted: false });
    expect(result.current).toBe(true);

    // async operation is pending after total of 700ms
    vi.advanceTimersByTime(400);
    rerender({ session: 1, asyncOperationIsCompleted: false });
    expect(result.current).toBe(true);

    // change session, hook should reset the state and return false
    vi.advanceTimersByTime(10);
    rerender({ session: 2, asyncOperationIsCompleted: false });
    expect(result.current).toBe(false);

    // async operation is pending after total of 300ms
    vi.advanceTimersByTime(300);
    rerender({ session: 2, asyncOperationIsCompleted: false });
    expect(result.current).toBe(true);

    // async operation is completed after total of 310ms
    vi.advanceTimersByTime(10);
    rerender({ session: 2, asyncOperationIsCompleted: true });
    expect(result.current).toBe(true);

    // hook returns FALSE after total of 610ms because the minimum time to be in the loading state has elapsed
    vi.advanceTimersByTime(300);
    rerender({ session: 2, asyncOperationIsCompleted: true });
    expect(result.current).toBe(false);
  });

  test(`when session changes(new async op 2 is being executed) while async op 1 is still pending
    but loading state is false because minimum time to be in the loading state has elapsed,
    state is reset and hook returns FALSE,
    and then when the new async operation completes within 300ms, returns FALSE`, () => {
    const { result, rerender } = renderHook(
      (props: UseDelayedLoadingResultProps) => useDelayedLoading(props),
      {
        initialProps: {
          session: 1,
          asyncOperationIsCompleted: false,
        },
      }
    );
    expect(result.current).toBe(false);

    // async operation is pending after total of 300ms
    vi.advanceTimersByTime(300);
    rerender({ session: 1, asyncOperationIsCompleted: false });
    expect(result.current).toBe(true);

    // async operation is pending after total of 700ms
    vi.advanceTimersByTime(400);
    rerender({ session: 1, asyncOperationIsCompleted: false });
    expect(result.current).toBe(true);

    // change session, hook should reset the state and return false
    vi.advanceTimersByTime(10);
    rerender({ session: 2, asyncOperationIsCompleted: false });
    expect(result.current).toBe(false);

    // async operation is pending after total of 300ms
    vi.advanceTimersByTime(200);
    rerender({ session: 2, asyncOperationIsCompleted: true });
    expect(result.current).toBe(false);
  });
});
