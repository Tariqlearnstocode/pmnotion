import React from 'react';
import Header from '../components/layout/Header';
import { ArrowRight, PlusCircle, LayoutDashboard, FileText, Settings } from 'lucide-react';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

const Dashboard: React.FC = () => {
  // Mock data
  const recentActivity = [
    { id: 1, type: 'entry', action: 'created', collection: 'Maintenance Requests', title: 'Fix broken sink', date: '2 hours ago' },
    { id: 2, type: 'collection', action: 'updated', collection: 'Rental Applications', title: null, date: '5 hours ago' },
    { id: 3, type: 'entry', action: 'updated', collection: 'Maintenance Requests', title: 'Replace bathroom fan', date: '1 day ago' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your properties.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Summary Cards */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Maintenance</h2>
              <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium">
                3 open
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Pending</span>
                  <span className="font-medium">1</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">In Progress</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Completed</span>
                  <span className="font-medium">5</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <Link 
                  to="/collections/maintenance"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  View all maintenance requests
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Applications</h2>
              <div className="bg-yellow-100 text-yellow-800 rounded-full px-2 py-1 text-xs font-medium">
                2 to review
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">New</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Under Review</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Approved</span>
                  <span className="font-medium">3</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <Link 
                  to="/collections/applications"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  View all applications
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Inspections</h2>
              <div className="bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-medium">
                Next: May 15
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Upcoming</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Completed</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Needs Attention</span>
                  <span className="font-medium">1</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <Link 
                  to="/collections/inspections"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  View all inspections
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b">
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              </CardHeader>
              <CardContent className="divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="py-3 flex items-start">
                    <div className="mr-4 mt-1">
                      {activity.type === 'entry' ? (
                        <FileText className="h-5 w-5 text-blue-500" />
                      ) : (
                        <LayoutDashboard className="h-5 w-5 text-purple-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        {activity.action === 'created' ? 'Created ' : 'Updated '}
                        <span className="font-medium">{activity.title || activity.collection}</span>
                        {activity.title && ` in ${activity.collection}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                    </div>
                  </div>
                ))}
                
                {recentActivity.length === 0 && (
                  <div className="py-6 text-center">
                    <p className="text-gray-500 text-sm">No recent activity to show</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader className="border-b">
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              </CardHeader>
              <CardContent className="space-y-3 py-4">
                <Link 
                  to="/collections/new"
                  className="flex items-center p-2 hover:bg-gray-50 rounded-md"
                >
                  <div className="bg-blue-100 p-2 rounded-md mr-3">
                    <PlusCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Create Collection</h3>
                    <p className="text-xs text-gray-500">Add a new collection to organize your data</p>
                  </div>
                </Link>
                
                <Link 
                  to="/forms"
                  className="flex items-center p-2 hover:bg-gray-50 rounded-md"
                >
                  <div className="bg-purple-100 p-2 rounded-md mr-3">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Manage Forms</h3>
                    <p className="text-xs text-gray-500">Create and share forms for your collections</p>
                  </div>
                </Link>
                
                <Link 
                  to="/settings/account"
                  className="flex items-center p-2 hover:bg-gray-50 rounded-md"
                >
                  <div className="bg-gray-100 p-2 rounded-md mr-3">
                    <Settings className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Account Settings</h3>
                    <p className="text-xs text-gray-500">Manage your account preferences</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;