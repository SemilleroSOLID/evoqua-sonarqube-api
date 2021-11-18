require('dotenv').config();

import fetchCookie from 'fetch-cookie';
import nodeFetch from 'node-fetch';

// We're patching the global fetch method to store cookies needed for
// authorizing API requests:
// TODO: use a headless browser to test how a browser would actually handle the
// requests (in regards to cookies and CORS):
globalThis.fetch = fetchCookie(nodeFetch) as unknown as typeof fetch;
