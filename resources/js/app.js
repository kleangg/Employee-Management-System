/**
 * Load all of the project's JavaScript dependencies — React, axios, etc.
 */
import '../css/app.css';

require('./bootstrap');

async function startApp() {
  // Mock mode is OPT-IN: append ?mock=true to any URL (e.g. /dashboard?mock=true)
  // to have the Service Worker intercept API calls with dummy data. By default
  // the SPA talks to the real Laravel backend at /api/...
  const isMockMode = window.location.search.includes('mock=true');

  if (isMockMode) {
    const { worker } = await import('./mocks/server');
    await worker.start({ onUnhandledRequest: 'bypass' });
    console.info('[EMS] Mock API mode is ON. Remove ?mock=true from the URL to use the real backend.');
  }

  require('./components/Example');
  require('./components/sidebar');
  require('./components/user_profile');
  require('./components/leave');
  require('./components/attendance');
  require('./components/reports');
  require('./components/login');
  require('./components/forgot_password');
  require('./components/employee_list');
  require('./components/add_employee');
  require('./components/edit_employee');
  require('./components/employee_profile');
  require('./components/dashboard');
}

startApp();
