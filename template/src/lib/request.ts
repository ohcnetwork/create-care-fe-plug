import { sleep } from "@/lib/utils";

type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean | null | undefined>;

type QueryParams = Record<string, QueryParamValue>;

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

interface ApiRoute<TRequest, TResponse> {
  baseUrl?: string;
  method?: HttpMethod;
  path: string;
  TRequest?: TRequest;
  TResponse: TResponse;
}

export const apiRoutes = <
  const T extends Record<string, ApiRoute<unknown, unknown>>,
>(
  routes: T,
): T => {
  return routes;
};

type ExtractRouteParams<T extends string> =
  T extends `${infer _Start}{${infer Param}}${infer Rest}`
    ? Param | ExtractRouteParams<Rest>
    : never;

type PathParams<T extends string> = {
  [_ in ExtractRouteParams<T>]: string;
};

interface ApiCallOptions<Route extends ApiRoute<unknown, unknown>> {
  pathParams?: PathParams<Route["path"]>;
  queryParams?: QueryParams;
  body?: Route["TRequest"];
  silent?: boolean | ((response: Response) => boolean);
  signal?: AbortSignal;
  headers?: HeadersInit;
  baseUrl?: string;
}

type HttpErrorCause = Record<string, unknown> | undefined;

export class HttpError extends Error {
  status: number;
  silent: boolean;
  cause?: HttpErrorCause;

  constructor({
    message,
    status,
    silent,
    cause,
  }: {
    message: string;
    status: number;
    silent: boolean;
    cause?: Record<string, unknown>;
  }) {
    super(message);
    this.status = status;
    this.silent = silent;
    this.cause = cause;
  }
}
export interface PaginatedResponse<TItem> {
  count: number;
  results: TItem[];
}

const getUrl = (
  path: string,
  query?: QueryParams,
  pathParams?: Record<string, string | number>,
  baseUrl?: string,
) => {
  if (pathParams) {
    path = Object.entries(pathParams).reduce(
      (acc, [key, value]) => acc.replace(`{${key}}`, `${value}`),
      path,
    );
  }
  const url = new URL(path, baseUrl || window.CARE_API_URL);
  if (query) {
    url.search = getQueryParams(query);
  }
  return url.toString();
};

const getQueryParams = (query: QueryParams) => {
  const qParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value == undefined) return;

    if (Array.isArray(value)) {
      value.forEach((v) => qParams.append(key, `${v}`));
      return;
    }

    qParams.set(key, `${value}`);
  });

  return qParams.toString();
};

export function getHeaders(additionalHeaders?: HeadersInit) {
  const headers = new Headers(additionalHeaders);
  const careAccessToken = localStorage.getItem("care_access_token")!;

  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${careAccessToken}`);

  return headers;
}

export async function getResponseBody<TData>(res: Response): Promise<TData> {
  if (!(res.headers.get("content-length") !== "0")) {
    return null as TData;
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");

  if (!isJson) {
    return (await res.text()) as TData;
  }

  try {
    return await res.json();
  } catch {
    return (await res.text()) as TData;
  }
}

async function request<Route extends ApiRoute<unknown, unknown>>(
  { path, method }: Route,
  options?: ApiCallOptions<Route>,
): Promise<Route["TResponse"]> {
  const url = getUrl(
    path,
    options?.queryParams,
    options?.pathParams,
    options?.baseUrl,
  );

  const fetchOptions: RequestInit = {
    method,
    headers: getHeaders(options?.headers),
    signal: options?.signal,
  };

  if (options?.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  let res: Response;

  try {
    res = await fetch(url, fetchOptions);
  } catch {
    throw new Error("Network Error");
  }

  const data = await getResponseBody<Route["TResponse"]>(res);

  if (!res.ok) {
    const isSilent =
      typeof options?.silent === "function"
        ? options.silent(res)
        : (options?.silent ?? false);

    throw new HttpError({
      message: "Request Failed",
      status: res.status,
      silent: isSilent,
      cause: data as unknown as Record<string, unknown>,
    });
  }

  return data;
}

const query = <Route extends ApiRoute<unknown, unknown>>(
  route: Route,
  options?: ApiCallOptions<Route>,
) => {
  return ({ signal }: { signal: AbortSignal }) => {
    return request(route, { ...options, signal });
  };
};

const debouncedQuery = <Route extends ApiRoute<unknown, unknown>>(
  route: Route,
  options?: ApiCallOptions<Route> & { debounceInterval?: number },
) => {
  return async ({ signal }: { signal: AbortSignal }) => {
    await sleep(options?.debounceInterval ?? 500);
    return query(route, { ...options })({ signal });
  };
};
query.debounced = debouncedQuery;

const mutate = <Route extends ApiRoute<unknown, unknown>>(
  route: Route,
  options?: ApiCallOptions<Route>,
) => {
  return (variables: Route["TRequest"]) => {
    return request(route, { ...options, body: variables });
  };
};

export { request, query, mutate };
