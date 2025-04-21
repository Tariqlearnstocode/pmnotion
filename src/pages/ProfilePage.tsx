import React from 'react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { AlertCircle, User, Mail, Briefcase } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <div className="flex">
              <div className="py-1"><AlertCircle className="h-5 w-5 mr-3"/></div>
              <div>
                <p className="font-bold">Profile Not Found</p>
                <p className="text-sm">Could not load user profile data. Please try logging out and back in.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900">Your Profile</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-gray-900">{userProfile.name || '-'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{userProfile.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Briefcase className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-gray-900 capitalize">{userProfile.role}</p>
                </div>
              </div>
               {/* Add more profile fields or actions as needed */}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage; 