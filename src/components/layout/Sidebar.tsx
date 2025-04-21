import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Collection } from '../../types';
import { Plus, Settings, Archive, Trash2, Inbox, Calendar, Table, Kanban } from 'lucide-react';

interface SidebarProps {
  collections: Collection[];
}

const Sidebar: React.FC<SidebarProps> = ({ collections = [] }) => {
  const location = useLocation();
  
  // Generate icon based on view type
  const getCollectionIcon = (viewType: string) => {
    switch (viewType) {
      case 'kanban':
        return <Kanban className="h-5 w-5" />;
      case 'table':
        return <Table className="h-5 w-5" />;
      case 'calendar':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Inbox className="h-5 w-5" />;
    }
  };

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-screen overflow-y-auto hidden md:block">
      <div className="py-6 flex flex-col h-full">
        <div className="px-3 mb-8">
          <Link 
            to="/collections/new" 
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Collection
          </Link>
        </div>
        
        <nav className="px-3 flex-1">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Your Collections
            </p>
            
            {collections.length === 0 ? (
              <div className="py-4 text-center text-sm text-gray-500">
                <p>No collections yet</p>
                <p className="mt-1">Create one to get started</p>
              </div>
            ) : (
              <ul className="mt-2 space-y-1">
                {collections.map((collection) => (
                  <li key={collection.id}>
                    <Link
                      to={`/collections/${collection.id}`}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        location.pathname === `/collections/${collection.id}` 
                          ? 'bg-gray-200 text-gray-900' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {getCollectionIcon(collection.viewType)}
                      <span className="ml-3 truncate">{collection.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="mt-8">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Templates
            </p>
            <ul className="mt-2 space-y-1">
              <li>
                <Link
                  to="/templates"
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    location.pathname === '/templates' 
                      ? 'bg-gray-200 text-gray-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Inbox className="mr-3 h-5 w-5 text-gray-500" />
                  Browse Templates
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        
        <div className="px-3 mt-auto space-y-1 pt-6 pb-4">
          <Link
            to="/settings"
            className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Settings className="mr-3 h-5 w-5 text-gray-500" />
            Settings
          </Link>
          <Link
            to="/trash"
            className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Trash2 className="mr-3 h-5 w-5 text-gray-500" />
            Trash
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;