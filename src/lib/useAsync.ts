import { useEffect, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T };

/**
 * Kör en asynkron funktion när beroendena ändras och returnerar
 * laddning/fel/data. Svar från gamla anrop ignoreras.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    fn().then(
      (data) => active && setState({ status: 'success', data }),
      (err: unknown) =>
        active &&
        setState({ status: 'error', error: err instanceof Error ? err.message : String(err) })
    );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
