"use client"; // Mark this component as a client component

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSessionData from '../hook/useSessionData'; // Adjust path as needed
import Spinner from '../components/ui/Spinner';
import Image from 'next/image';
const LoginForm: React.FC = () => {
  const router = useRouter();
  const { session, loading } = useSessionData();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(''); // Clear error message on new attempt

    const result = await signIn('credentials', {
      redirect: false, // Prevent automatic redirect, we handle it manually
      phone,
      password,
    });

    if (result?.error) {
      setErrorMessage("Incorrect phone or password"); // Set error if login fails
    } else if (result?.ok) {
      // Success case, will redirect after session is updated
    }
  };

  // Effect to handle redirection based on the session's status
  useEffect(() => {
    if (loading) return; // Wait for session data to load
    if (!session) {
      router.push("/"); // Redirect to sign-in page if not authenticated
    } else {
      const userRole = session.user?.role; // Get the role from session
      switch (userRole) {
        case "admin":
          router.push("/admin");
          break;
        case "doctor":
          router.push("/doctor");
          break;
        case "reception":
          router.push("/reception");
          break;
          case "User":
            router.push("/user");
            break;
        default:
          router.push("/unauthorized"); // Handle any other roles or missing roles
      }
    }
  }, [router, session, loading]); // Include loading instead of status

  if (loading) return <Spinner />;

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev); // Toggle the showPassword state
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cover bg-center px-4" style={{ backgroundImage: `url('bg6.jpg')` }}>
    <div className="flex w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden">
      <div className="w-full md:w-1/2 p-6 bg-slate-100/80 backdrop-blur-md">
        <div className="flex flex-col items-center py-6">
          <Image 
                 src="/assets/file.png" // Path to your image
                 alt="Example Image"
                 width={150}  // Desired width
                 height={150} // Desired height
                 priority    // Optional: load the image with high priority
               />
            <h2 className="mt-3 text-2xl font-bold text-black-900"> Dental Clinic</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition shadow-lg"
          >
            Login
          </button>

          {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}
        </form>
         {/* Powered by SmartDent */}
  <div className="mt-8 text-center text-sm text-gray-500">
    Powered by <span className="font-semibold text-blue-600">SmartDent</span>
  </div>
      </div>

      <div className="hidden md:flex w-1/2 items-center justify-center relative">
      <Image
  src="/bg.jpg"
  alt="Dental Clinic"
  layout="responsive"
  width={16}
  height={9} // Maintain aspect ratio (e.g., 16:9)
  className="object-cover"
/>
      </div>
    </div>
  </div>
  );
};

export default LoginForm;
