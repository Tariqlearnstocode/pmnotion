import React from 'react';
import { Template } from '../../types';
import { Card, CardContent, CardHeader, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { Kanban, Table, Calendar } from 'lucide-react';

interface TemplateCardProps {
  template: Template;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const navigate = useNavigate();
  
  const getViewIcon = () => {
    switch (template.defaultViewType) {
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
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="flex items-center space-x-2">
        {getViewIcon()}
        <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="text-sm text-gray-500 mb-4">{template.description}</p>
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700">Includes:</p>
          <ul className="text-xs text-gray-600 pl-5 list-disc space-y-1">
            <li>{template.fields.length} predefined fields</li>
            <li>{template.statuses.length} workflow stages</li>
            <li>{template.defaultViewType.charAt(0).toUpperCase() + template.defaultViewType.slice(1)} view</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate(`/templates/${template.id}/use`)}
        >
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;