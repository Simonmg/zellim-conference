import localStorage from 'mobx-localstorage';

export const ferdiVersion = '2.0.1';
export const ferdiLocale = 'es';

export const prepareAuthRequest = (
    options = { method: 'GET' },
    auth = true,
) => {
    const request = Object.assign(options, {
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'X-Franz-Source': 'desktop',
          'X-Franz-Version': ferdiVersion,
          'X-Franz-platform': 'win32',
          'X-Franz-Timezone-Offset': new Date().getTimezoneOffset(),
          'X-Franz-System-Locale': ferdiLocale,
          // @ts-expect-error Property 'headers' does not exist on type '{ method: string; }'.
          ...options.headers,
        },
      });
    
      if (auth) {
        request.headers.Authorization = `Bearer ${localStorage.getItem(
          'authToken',
        )}`;
      }
    
      return request;
};

export const getConferenceData = (
  url,
  options,
  auth
  ) =>
    
    window.fetch(url, prepareAuthRequest(options, auth));

export const sendAuthRequest = (
    url,
    options,
    auth,
  ) =>
    // @ts-expect-error Argument of type '{ method: string; } & { mode: string; headers: any; }' is not assignable to parameter of type 'RequestInit | undefined'.
    window.fetch(url, prepareAuthRequest(options, auth));

