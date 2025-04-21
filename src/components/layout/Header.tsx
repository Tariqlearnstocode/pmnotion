import React, { useState } from 'react';
import { Menu, X, Bell, Settings, User, Home, LogOut } from 'lucide-react';
import Button from '../ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { userProfile, session } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
      setIsMenuOpen(false);
      setIsProfileMenuOpen(false);
    } catch (error: any) {
      console.error('Error signing out:', error.message);
    }
  };

  const displayName = userProfile?.name || session?.user?.email || 'User';
  const userInitial = displayName ? displayName.charAt(0).toUpperCase() : '?';
  const userEmail = session?.user?.email || 'No email available';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <Home className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">PM Flow</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:ml-6 md:flex md:space-x-8">
            {session && (
                <>
                 <Link to="/collections" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                   Collections
                 </Link>
                 <Link to="/builder" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                   Builder
                 </Link>
                 </>
             )}
          </nav>
          
          {/* Right side icons and profile - Only show if logged in */}
          {session ? (
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative ml-3">
                <div>
                  <button 
                    type="button" 
                    className="flex items-center max-w-xs bg-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    id="user-menu-button"
                    aria-expanded={isProfileMenuOpen}
                    aria-haspopup="true"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                     <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                      {userInitial}
                    </div>
                    <span className="ml-2 hidden lg:block text-sm font-medium text-gray-700">{displayName}</span>
                  </button>
                </div>

                {isProfileMenuOpen && (
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-40"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                    >
                        Your Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
             <div className="hidden md:flex items-center space-x-2">
                 <Button variant="outline" onClick={() => navigate('/login')}>Login</Button>
                 <Button variant="primary" onClick={() => navigate('/signup')}>Sign Up</Button>
             </div>
          )}
          
          {/* Mobile menu button - Only show if logged in */}
          {session && (
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile menu - Only show if logged in */}
      {session && isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 px-4">
            <Link 
              to="/collections" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Collections
            </Link>
            <Link 
              to="/builder" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Builder
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                 <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {userInitial}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{displayName}</div>
                <div className="text-sm font-medium text-gray-500">{userEmail}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 px-4">
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="mr-3 h-5 w-5 text-gray-500" />
                Your Profile
              </Link>
              <button
                onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 flex items-center"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-500" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;