import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import TemplateCard from '../components/templates/TemplateCard';
import { Template, Collection } from '../types';
import { Search } from 'lucide-react';

const Templates: React.FC = () => {
  // Mock collections data
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: '1',
      name: 'Maintenance Requests',
      description: 'Track and manage maintenance issues across all properties',
      icon: '🔧',
      viewType: 'kanban',
      ownerId: 'user1',
      createdAt: '2024-04-10T12:00:00Z',
      updatedAt: '2024-04-10T12:00:00Z'
    },
    {
      id: '2',
      name: 'Rental Applications',
      description: 'Review and process applications for your rental properties',
      icon: '📝',
      viewType: 'table',
      ownerId: 'user1',
      createdAt: '2024-04-09T15:30:00Z',
      updatedAt: '2024-04-09T15:30:00Z'
    }
  ]);
  
  // Mock templates data
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: 't1',
      name: 'Maintenance Tracker',
      description: 'Track repair requests and maintenance tasks across all your properties',
      icon: '🔧',
      defaultViewType: 'kanban',
      fields: [
        { name: 'Issue Description', type: 'text', required: true, order: 1 },
        { name: 'Property/Unit', type: 'select', options: ['Select property...'], required: true, order: 2 },
        { name: 'Urgency', type: 'select', options: ['Low', 'Medium', 'High'], required: true, order: 3 },
        { name: 'Reported By', type: 'text', required: false, order: 4 },
        { name: 'Photos', type: 'file', required: false, order: 5 },
        { name: 'Assigned To', type: 'user', required: false, order: 6 }
      ],
      statuses: [
        { name: 'New', color: '#3366FF', order: 1 },
        { name: 'In Progress', color: '#FACC15', order: 2 },
        { name: 'Awaiting Parts', color: '#F97316', order: 3 },
        { name: 'Completed', color: '#22C55E', order: 4 }
      ]
    },
    {
      id: 't2',
      name: 'Rental Application Tracker',
      description: 'Process and evaluate potential tenant applications with a streamlined workflow',
      icon: '📝',
      defaultViewType: 'table',
      fields: [
        { name: 'Applicant Name', type: 'text', required: true, order: 1 },
        { name: 'Email', type: 'text', required: true, order: 2 },
        { name: 'Phone', type: 'text', required: true, order: 3 },
        { name: 'Property/Unit', type: 'select', options: ['Select property...'], required: true, order: 4 },
        { name: 'Income', type: 'number', required: true, order: 5 },
        { name: 'References', type: 'text', required: false, order: 6 },
        { name: 'Documents', type: 'file', required: false, order: 7 },
        { name: 'Notes', type: 'text', required: false, order: 8 }
      ],
      statuses: [
        { name: 'New', color: '#3366FF', order: 1 },
        { name: 'Reviewing', color: '#FACC15', order: 2 },
        { name: 'Background Check', color: '#F97316', order: 3 },
        { name: 'Approved', color: '#22C55E', order: 4 },
        { name: 'Rejected', color: '#EF4444', order: 5 }
      ]
    },
    {
      id: 't3',
      name: 'Property Inspection',
      description: 'Schedule and document property inspections with photos and notes',
      icon: '🏠',
      defaultViewType: 'calendar',
      fields: [
        { name: 'Property/Unit', type: 'select', options: ['Select property...'], required: true, order: 1 },
        { name: 'Inspection Type', type: 'select', options: ['Move-in', 'Move-out', 'Routine', 'Damage'], required: true, order: 2 },
        { name: 'Date', type: 'date', required: true, order: 3 },
        { name: 'Inspector', type: 'user', required: true, order: 4 },
        { name: 'Tenant Present', type: 'checkbox', required: false, order: 5 },
        { name: 'Photos', type: 'file', required: false, order: 6 },
        { name: 'Notes', type: 'text', required: false, order: 7 }
      ],
      statuses: [
        { name: 'Scheduled', color: '#3366FF', order: 1 },
        { name: 'Completed', color: '#22C55E', order: 2 },
        { name: 'Needs Follow-up', color: '#F97316', order: 3 }
      ]
    },
    {
      id: 't4',
      name: 'Lease Tracking',
      description: 'Manage lease agreements, renewals, and related documents',
      icon: '📄',
      defaultViewType: 'table',
      fields: [
        { name: 'Property/Unit', type: 'select', options: ['Select property...'], required: true, order: 1 },
        { name: 'Tenant Name', type: 'text', required: true, order: 2 },
        { name: 'Lease Start', type: 'date', required: true, order: 3 },
        { name: 'Lease End', type: 'date', required: true, order: 4 },
        { name: 'Monthly Rent', type: 'number', required: true, order: 5 },
        { name: 'Security Deposit', type: 'number', required: true, order: 6 },
        { name: 'Lease Document', type: 'file', required: true, order: 7 },
        { name: 'Notes', type: 'text', required: false, order: 8 }
      ],
      statuses: [
        { name: 'Active', color: '#22C55E', order: 1 },
        { name: 'Expiring Soon', color: '#FACC15', order: 2 },
        { name: 'Renewal Offered', color: '#3366FF', order: 3 },
        { name: 'Terminated', color: '#EF4444', order: 4 }
      ]
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredTemplates = templates.filter(
    template => template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar collections={collections} />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Templates</h2>
                <p className="text-gray-500 mt-1">Start with a pre-built template for common property management workflows</p>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {filteredTemplates.length === 0 ? (
              <div className="bg-white p-6 text-center rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-500">
                  Try a different search term or browse all templates
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Templates;