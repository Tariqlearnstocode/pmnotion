import React from 'react';
import { Collection } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { useNavigate } from 'react-router-dom';
import { Kanban, Table, Calendar, MoreVertical } from 'lucide-react';

interface CollectionCardProps {
  collection: Collection;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  const navigate = useNavigate();
  
  const getViewIcon = () => {
    switch (collection.viewType) {
      case 'kanban':
        return <Kanban className="h-5 w-5 text-blue-600" />;
      case 'table':
        return <Table className="h-5 w-5 text-green-600" />;
      case 'calendar':
        return <Calendar className="h-5 w-5 text-purple-600" />;
      default:
        return <Kanban className="h-5 w-5 text-blue-600" />;
    }
  };
  
  const handleClick = () => {
    navigate(`/collections/${collection.id}`);
  };
  
  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-md"
      onClick={handleClick}
      hoverable
    >
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {getViewIcon()}
          <h3 className="text-lg font-medium text-gray-900">{collection.name}</h3>
        </div>
        <button 
          className="text-gray-400 hover:text-gray-500"
          onClick={(e) => {
            e.stopPropagation();
            // Add your action here
          }}
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">{collection.description}</p>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Created: {new Date(collection.createdAt).toLocaleDateString()}</span>
          <span className="flex items-center">
            {collection.viewType.charAt(0).toUpperCase() + collection.viewType.slice(1)} view
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollectionCard;