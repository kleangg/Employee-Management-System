/**
 * First we will load all of this project's JavaScript dependencies which
 * includes React and other helpers. It's a great starting point while
 * building robust, powerful web applications using React + Laravel.
 */
import '../css/app.css';

require('./bootstrap');

async function startApp() {
  const isMockMode = window.location.search.includes('mock=true') || process.env.NODE_ENV === 'development';

  if (isMockMode) {
    const { worker } = await import('./mocks/server');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  require('./components/Example');
  require('./components/sidebar');
  require('./components/user_profile');
  require('./components/leave');
  require('./components/attendance');
  require('./components/reports');
}

startApp();