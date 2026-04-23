window._ = require('lodash');

try {
    require('bootstrap');
} catch (e) {}

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end.
 */
window.axios = require('axios');

// Default headers every request will carry
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Accept'] = 'application/json';

// When the SPA is served from the same Laravel origin (http://localhost:8000),
// baseURL of '/' is enough. If you ever point at a different host, change this.
window.axios.defaults.baseURL = '/';

// Request interceptor: automatically attach the JWT token (if present)
window.axios.interceptors.request.use(function (config) {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
});

// Response interceptor: if the server says the token is invalid/expired,
// clear local state and send the user back to the login page.
window.axios.interceptors.response.use(
    function (response) { return response; },
    function (error) {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login-page')) {
                window.location.href = '/login-page';
            }
        }
        return Promise.reject(error);
    }
);
