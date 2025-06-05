const mongoose = require('mongoose');

const getRandomDate = (daysFromNow) =>
  new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);

module.exports = [
  { title: 'Set up project structure', description: 'Initialize repo and base layout.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(5), status: 'Backlog' },
  { title: 'Design login page', description: 'Create UI for login/signup.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(3), status: 'In Progress' },
  { title: 'Implement WebSocket', description: 'Real-time task sync.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(7), status: 'Review' },
  { title: 'Add user authentication', description: 'JWT + middleware setup.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(4), status: 'Backlog' },
  { title: 'Setup MongoDB models', description: 'User, Task, Column schemas.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(2), status: 'Done' },
  { title: 'Configure ESLint + Prettier', description: 'Code formatting rules.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(6), status: 'Backlog' },
  { title: 'Create dashboard layout', description: 'Main kanban UI.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(5), status: 'In Progress' },
  { title: 'Build column drag & drop', description: 'Using react-beautiful-dnd.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(8), status: 'Review' },
  { title: 'Style components with Tailwind', description: 'Base theming and spacing.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(4), status: 'Done' },
  { title: 'Add task modals', description: 'Edit/view task modal.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(6), status: 'Backlog' },
  { title: 'Implement notifications', description: 'Socket + in-app toasts.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(3), status: 'Backlog' },
  { title: 'Connect Redis pub/sub', description: 'Enable real-time backend sync.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(2), status: 'In Progress' },
  { title: 'Write unit tests', description: 'Jest + model testing.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(9), status: 'Backlog' },
  { title: 'Optimize database queries', description: 'Indexes and lean queries.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(7), status: 'Review' },
  { title: 'Add mobile responsiveness', description: 'Media queries for layout.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(10), status: 'Backlog' },
  { title: 'Implement search filter', description: 'Filter by title/status.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(6), status: 'In Progress' },
  { title: 'Enable sorting by date', description: 'Deadline-based sort.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(5), status: 'Backlog' },
  { title: 'Create settings page', description: 'User preferences.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(3), status: 'Review' },
  { title: 'Set up CI/CD', description: 'GitHub Actions for builds.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(4), status: 'Done' },
  { title: 'Integrate error logging', description: 'Sentry or custom logs.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(7), status: 'Backlog' },
  { title: 'Handle 404 routes', description: 'Catch-all React router.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(1), status: 'Done' },
  { title: 'Add loader/skeleton UI', description: 'For API fetching.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(5), status: 'In Progress' },
  { title: 'Create public read-only view', description: 'For shared boards.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(8), status: 'Backlog' },
  { title: 'Export tasks as CSV', description: 'Downloadable task data.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(6), status: 'Review' },
  { title: 'Write documentation', description: 'README + API docs.', assignee: new mongoose.Types.ObjectId(), deadline: getRandomDate(10), status: 'Backlog' }
];
