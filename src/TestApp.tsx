import { useEffect, useState } from "react";
import { useDelayedLoading } from "./useDelayedLoadingState";
import "./App.css";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

function TestApp() {
  return <TestComponent_tanstack_query />;
}

export default TestApp;

const asyncOperation = (val: number): Promise<string[]> => {
  // const ms = 4105;
  const ms = Math.random() * 2000;
  return new Promise((res) => {
    const t0 = performance.now();

    setTimeout(() => {
      const t1 = performance.now();
      console.log(`async operation took ${t1 - t0} milliseconds. Got new async value = ${val}`);
      res(Array(10).fill(val));
    }, ms);
  });
};

async function* asyncValuesGenerator(): AsyncGenerator<string[]> {
  let nextValue = 1;

  while (true) {
    const value = await asyncOperation(nextValue);
    yield value;

    nextValue += 1;
  }
}

const asyncValuesIterator = asyncValuesGenerator();

const useGetAsyncValues = (
  nextValue: number
): { data: string | undefined; loading: boolean; completed: boolean; error: boolean } => {
  const [data, setData] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const asyncOp = async () => {
      setLoading(true);
      setError(false);
      setCompleted(false);

      const t0 = performance.now();
      const value = await asyncValuesIterator.next();
      const t1 = performance.now();

      console.log(`async operation took ${t1 - t0} milliseconds. Got new async value = ${value.value}`);

      setData(value.value);
      setLoading(false);
      setCompleted(true);
    };

    asyncOp();
  }, [nextValue]);

  return { data, loading, completed, error };
};

// using custom hook to asynchronously fetch values
function TestComponent() {
  const [nextValue, setNextValue] = useState(1);
  const { data, loading, completed, error } = useGetAsyncValues(nextValue);
  const delayedLoading = useDelayedLoading({
    asyncOperationIsCompleted: completed,
    session: nextValue,
    delay: 1000,
  });

  return (
    <div className="h-32 w-32">
      Content: {delayedLoading ? "loading..." : data}
      <button disabled={loading || delayedLoading} onClick={() => setNextValue((v) => v + 1)}>
        Next value
      </button>
    </div>
  );
}

// using tanstack query to asynchronously fetch values
function TestComponent_tanstack_query() {
  const [nextValue, setNextValue] = useState(1);
  const { data, isPending, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["test", nextValue],
    queryFn: () => asyncOperation(nextValue),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
  console.log(`-------------------------- data = ${data}`);
  console.log(`-------------------------- isPending = ${isPending}`);
  console.log(`-------------------------- isFetching = ${isFetching}`);
  const delayedLoading = useDelayedLoading({
    asyncOperationIsCompleted: !!data && !isPlaceholderData,
    session: nextValue,
    delay: 500,
  });

  return (
    <div className="h-32 w-32">
      Content: {delayedLoading ? <Loading /> : data}
      <button disabled={isPending || isFetching || delayedLoading} onClick={() => setNextValue((v) => v + 1)}>
        Next value
      </button>
    </div>
  );
}

function Loading() {
  console.log("Loading component ///////////////////////");
  return <>loading...</>;
}
