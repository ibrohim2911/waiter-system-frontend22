import React, { useState, useEffect } from 'react';
import { me as getMe } from '../../services/getMe';
import { useAuth } from '../../context/AuthContext';
import { UserCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';

const Profile = () => {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getMe();
        setUser(userData);
      } catch (err) {
        setError('Failed to fetch user data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div className="text-center text-zinc-300 p-10">Loading profile...</div>;
  }

  if (error || !user) {
    return <div className="text-center text-red-400 p-10">{error || 'User not found.'}</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 pb-20 p-4">
      <div className="max-w-sm">
        <div className="bg-zinc-800 rounded-lg shadow-xl p-4 mb-4">
          <div className="flex flex-col items-center">
            <UserCircleIcon className="h-16 w-16 text-blue-400 mb-2" />
            <h1 className="text-xl font-bold">{user.name || user.username}</h1>
            <p className="text-zinc-400 text-base capitalize">{user.role}</p>
          </div>
          <div className="mt-4 border-t border-zinc-700 pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-zinc-400">Phone:</span>
              <span className="text-zinc-200 text-sm">{user.phone_number || 'Not provided'}</span>
            </div>
          </div>
          <div className="mt-4 border-t border-zinc-700 pt-4">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
