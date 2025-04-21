import React from 'react';
import { Collection } from '../../types';
import CollectionCard from './CollectionCard';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CollectionsListProps {
  collections: Collection[];
}

const CollectionsList: React.FC<CollectionsListProps> = ({ collections = [] }) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Collections</h2>
        <Button 
          variant="primary"
          icon={<Plus className="h-5 w-5" />}
          onClick={() => navigate('/collections/new')}
        >
          New Collection
        </Button>
      </div>
      
      {collections.length === 0 ? (
        <div className="bg-white p-6 text-center rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No collections yet</h3>
          <p className="text-gray-500 mb-4">
            Collections help you organize your property management tasks and data.
          </p>
          <Button 
            variant="primary"
            icon={<Plus className="h-5 w-5" />}
            onClick={() => navigate('/collections/new')}
          >
            Create your first collection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionsList;