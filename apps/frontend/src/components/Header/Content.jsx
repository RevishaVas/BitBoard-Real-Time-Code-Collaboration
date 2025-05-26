
import React from 'react';
import Home from '../codeCollaboration/Home';

const Content = ({ activeTab }) => {
 
  const tabContent = {
    Dashboard: <Home />,
    Kanban: <div className="p-4 sm:ml-64 mt-14">Kanban Content</div>,
    Inbox: <div className="p-4 sm:ml-64 mt-14">Inbox Content</div>,
    Users: <div className="p-4 sm:ml-64 mt-14">Users Content</div>,
    Products: <div className="p-4 sm:ml-64 mt-14">Products Content</div>,
    'Sign In': <div className="p-4 sm:ml-64 mt-14">Sign In Content</div>,
    'Sign Up': <div className="p-4 sm:ml-64 mt-14">Sign Up Content</div>, 
  };

  return <div className="p-4 sm:ml-64">{tabContent[activeTab]}</div>;
};

export default Content;