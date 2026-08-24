type Listener = (loading: boolean) => void;

let loading = false;

const listeners = new Set<Listener>();

let startedAt = 0;

const MINIMUM_DISPLAY_TIME = 500;

function notify() {
  listeners.forEach((listener) => {
    listener(loading);
  });
}

export function startNavigationLoading() {
  /*
   * Ignore duplicate starts while a navigation is
   * already in progress.
   */
  if (loading) {
    return;
  }

  loading = true;
  startedAt = Date.now();

  notify();
}

export function stopNavigationLoading() {
  if (!loading) {
    return;
  }

  const elapsed = Date.now() - startedAt;
  const remaining = MINIMUM_DISPLAY_TIME - elapsed;

  if (remaining > 0) {
    window.setTimeout(() => {
      loading = false;
      notify();
    }, remaining);

    return;
  }

  loading = false;
  notify();
}

export function getNavigationLoading() {
  return loading;
}

export function subscribeNavigationLoading(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
