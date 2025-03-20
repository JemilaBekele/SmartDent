"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Spinner from '@/app/components/ui/Spinner';
import Image from 'next/image';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
type User = {
  _id: string;
  username: string;
  phone: string;
  role: string;
  image?: string; // Marked image as optional
};

type UserDetailsProps = {
  params: {
    id: number;
  };
};

const UserDetails: React.FC<UserDetailsProps> = ({ params }) => {
  const userId = params.id;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/see/${userId}`);
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Error fetching user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleEdit = () => {
    router.push(`/admin/users/edit/${userId}`);
  };

  const handleDelete = async () => {
    const confirmDelete = async () => {
    try {
      await axios.delete(`/api/see/${userId}`);
      router.push('/admin/users');
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Error deleting user.");
    }
    finally {
      toast.dismiss(); // Dismiss the confirmation toast after the operation
    }
  }
  toast.warn(
    <div>
      <span>Are you sure you want to delete ?</span>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <button onClick={() => confirmDelete()}>Yes</button>
        <button onClick={() => toast.dismiss()}>No</button>
      </div>
    </div>,
    {
      position: "top-right",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
    }
  );
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await axios.post('/api/register/password/admin', { newPassword, userId });
      setMessage(`${response.data.message} password Reset successfully!`);
    
      setNewPassword(''); // Clear password input
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("Error resetting password.");
    } finally {
      setResetLoading(false);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev); // Toggle the showPassword state
  };
  if (loading) return <div className="text-center"><Spinner /></div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center">User Details</h1>
      
      {/* Displaying the user image if it exists */}
      {user.image && (
        <div className="mb-4 flex justify-center">
          <Image src={user.image} alt={user.username} 
           width={100} 
           height={200} 
           className="rounded-full w-32 h-32 mx-auto object-cover" />
        </div>
      )}
      
      <div className="mb-4 flex">
        <h2 className="text-xl font-semibold mr-2">Name:</h2>
        <p className="text-gray-700 text-xl">{user.username}</p>
      </div>
      <div className="mb-4 flex">
        <h2 className="text-xl font-semibold mr-2">Phone:</h2>
        <p className="text-gray-700 text-xl">{user.phone}</p>
      </div>
      <div className="mb-4 flex">
        <h2 className="text-xl font-semibold mr-2">Role:</h2>
        <p className="text-gray-700 text-xl">{user.role}</p>
      </div>
      <div className="flex justify-center gap-4 mt-6">
        <EditOutlined className="text-2xl text-blue-500" onClick={handleEdit} />
        <DeleteOutlined className="text-2xl text-red-500" onClick={handleDelete} />
      </div>

      {/* Reset Password Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Reset Password</h2>
        <form onSubmit={handleResetPassword}>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border rounded px-4 py-2 w-full mb-4"
            required
          />
           <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? 'Hide' : 'Show'} {/* Button text based on visibility */}
          </button>
          </div>
          <button
            type="submit"
            className={`bg-blue-500 text-white py-2 px-4 rounded ${resetLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={resetLoading}
          >
            {resetLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        {message && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                <strong>Success:</strong> {message}
              </div>
        )}
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
      <ToastContainer />
    </div>
  );
};

export default UserDetails;
