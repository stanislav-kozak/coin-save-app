type FetchLike = (input: Request) => Promise<Response>;

type Options = {
  refreshUrl: string;
  onAuthFailure: () => void;
  fetchImpl?: FetchLike;
};

// A 401 from these means "bad credentials", not "expired access token".
const NO_REFRESH_PATHS = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout'];

export function createRefreshingFetch({
  refreshUrl,
  onAuthFailure,
  fetchImpl = (input) => fetch(input),
}: Options): FetchLike {
  let pendingRefresh: Promise<boolean> | null = null;

  function refreshOnce(): Promise<boolean> {
    pendingRefresh ??= fetchImpl(new Request(refreshUrl, { method: 'POST' }))
      .then(
        (res) => res.ok,
        () => false,
      )
      .finally(() => {
        pendingRefresh = null;
      });
    return pendingRefresh;
  }

  return async (input) => {
    const retry = input.clone(); // body can be read only once
    const response = await fetchImpl(input);

    if (response.status !== 401 || NO_REFRESH_PATHS.includes(new URL(input.url).pathname)) {
      return response;
    }
    if (!(await refreshOnce())) {
      onAuthFailure();
      return response;
    }
    return fetchImpl(retry);
  };
}
