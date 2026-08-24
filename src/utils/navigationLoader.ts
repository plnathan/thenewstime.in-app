type Listener = (loading: boolean) => void;

let loading = false;

const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => {
    listener(loading);
  });
}

export function startNavigationLoading() {
  loading = true;
  notify();
}

export function stopNavigationLoading() {
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
