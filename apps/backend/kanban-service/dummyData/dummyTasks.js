const mongoose = require('mongoose');

const getRandomDate = (daysFromNow) =>
  new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);

module.exports = [
  {
    title: 'Setup UI Framework',
    description: 'Initialize and configure the base UI framework.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(9),
    status: 'In Progress'
  },
  {
    title: 'Implement Login Page',
    description: 'Develop and style the user login interface.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(10),
    status: 'Done'
  },
  {
    title: 'Onboarding Checklist',
    description: 'Create a step-by-step onboarding experience.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(4),
    status: 'Done'
  },
  {
    title: 'Backend API Auth',
    description: 'Setup authentication middleware for API.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(6),
    status: 'In Progress'
  },
  {
    title: 'User Analytics',
    description: 'Implement tracking for user behavior and metrics.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(10),
    status: 'In Progress'
  },
  {
    title: 'Export REST API',
    description: 'Create endpoints for exporting data.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(7),
    status: 'Done'
  },
  {
    title: 'Elastic Log Bridge',
    description: 'Connect application logs to ElasticSearch.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(5),
    status: 'To do'
  },
  {
    title: 'Queue Monitor',
    description: 'Build UI for monitoring async job queues.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(3),
    status: 'Done'
  },
  {
    title: 'Comment System',
    description: 'Enable comments on tasks or posts.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(6),
    status: 'To do'
  },
  {
    title: 'BitBoard Integration Test',
    description: 'Test BitBoard functionality and integrations.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(8),
    status: 'In Progress'
  },
  {
    title: 'Forgotten Redis Connector',
    description: 'Fix and integrate missing Redis connections.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(7),
    status: 'Done'
  },
  {
    title: 'Onboarding Checklist',
    description: 'Ensure onboarding checklist matches company SOP.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(5),
    status: 'To do'
  },
  {
    title: 'Optimize DB Queries',
    description: 'Optimize query performance and indexing.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(8),
    status: 'In Progress'
  },
  {
    title: 'Fix Real-Time Chat Bug',
    description: 'Resolve bugs in the real-time messaging feature.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(2),
    status: 'To do'
  },
  {
    title: 'Integrate Notifications',
    description: 'Add push/in-app notifications support.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(6),
    status: 'Done'
  },
  {
    title: 'Graph View Controller',
    description: 'Handle rendering and updates to graph views.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(6),
    status: 'In Progress'
  },
  {
    title: 'Graph Controller',
    description: 'Control data flow and actions in graphs.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(7),
    status: 'To do'
  },
  {
    title: 'Neo4j Sync Layer',
    description: 'Sync Neo4j data with backend changes.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(5),
    status: 'In Progress'
  },
  {
    title: 'Graph Metrics Module',
    description: 'Analyze and visualize graph-related metrics.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(9),
    status: 'Done'
  },
  {
    title: 'Audit History Tracker',
    description: 'Track and store change history of records.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(4),
    status: 'To do'
  },
  {
    title: 'WebSocket Gateway',
    description: 'Setup WebSocket connection gateway.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(3),
    status: 'In Progress'
  },
  {
    title: 'Redis Stream Aggregator',
    description: 'Aggregate Redis streams for analytics.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(5),
    status: 'Done'
  },
  {
    title: 'BitBoard Integration Test',
    description: 'Test BitBoard integration across modules.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(7),
    status: 'To do'
  },
  {
    title: 'Deadline Reminder Logic',
    description: 'Implement logic to notify about deadlines.',
    assignee: new mongoose.Types.ObjectId(),
    deadline: getRandomDate(5),
    status: 'Done'
  }
];
