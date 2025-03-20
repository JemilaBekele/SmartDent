"use client";
import React, { useState } from "react";
import { MenuOutlined, LogoutOutlined } from '@ant-design/icons';
import Link from "next/link";
import {  signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from 'next/image'
type NavItem = {
  label: string;
  icon: React.ReactNode; // Using React.ReactNode for icons
  link: string;
};

type SideNavbarProps = {
  items: NavItem[];
};



const SideNavbar: React.FC<SideNavbarProps> = ({ items }) => {

  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Memoize user data to avoid unnecessary re-renders


  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await signOut({ redirect: false }); // Perform client-side sign-out
    router.push('/'); // Redirect to sign-in page after logout
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-1 left-4 z-30 p-0 rounded-md text-gray-800 hover:bg-gray-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white md:hidden"
      >
        <span className="sr-only">Toggle sidebar</span>
        <MenuOutlined className="h-5 w-5" aria-hidden="true" />
      </button>

      <div
        className={`fixed top-0 left-0 h-screen bg-white z-20 w-60 border-r border-gray-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <div className="nav">
          <div className="p-6">
            <div className="flex flex-col justify-start items-center">
              
              <Image 
        src="/assets/file.png" // Path to your image
        alt="Example Image"
        width={100}  // Desired width
        height={130} // Desired height
        priority    // Optional: load the image with high priority
      />
              
              <div className="my-4 border-b border-gray-300 pb-4">
                {items.slice(0, 11).map((item, index) => (
                  <Link key={index} href={item.link}>
                    <div className="flex mb-2 justify-start items-center gap-4 pl-5 hover:bg-blue-400 p-2 rounded-md group cursor-pointer hover:shadow-lg">
                      {item.icon} {/* Using the icon directly */}
                      <h3 className="text-base text-gray-800 group-hover:text-white font-semibold">
                        {item.label}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="my-4">
                <div
                  className="flex mb-2 justify-start items-center gap-4 pl-5 border border-gray-300 hover:bg-blue-400 p-2 rounded-md group cursor-pointer hover:shadow-lg"
                  onClick={handleLogout}
                >
                  <LogoutOutlined className="text-2xl text-gray-600 group-hover:text-white" />
                  <h3 className="text-base text-gray-800 group-hover:text-white font-semibold">
                    Logout
                  </h3>
                </div>
              </div>
              <div className="mt-8 text-center text-sm text-gray-500">
    Powered by <span className="font-semibold text-blue-600">SmartDent</span>
  </div>
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-10 bg-black opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default SideNavbar;
