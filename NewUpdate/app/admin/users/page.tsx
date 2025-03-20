"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import DataTable from "@/app/components/ui/TableComponent";
import { CodeOutlined } from "@ant-design/icons";
import Spinner from '@/app/components/ui/Spinner';
type User = {
  _id: string;
  username: string;
  phone: string;
  role: string;
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true); 
        const response = await axios.get("/api/register");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }finally {
        setLoading(false); // Set loading to false after the process completes
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    {
      header: "Username",
      key: "username" as keyof User,
      render: (user: User) => user.username,
    },
    {
      header: "Phone",
      key: "phone" as keyof User,
      render: (user: User) => user.phone,
    },
    {
      header: "Role",
      key: "role" as keyof User,
      render: (user: User) => user.role,
    },
  ];
  if (loading) return <div className="text-center"><Spinner/></div>;
  return (
    <div className="mt-24 ml-0 lg:ml-60 w-full max-w-4xl lg:max-w-[calc(100%-15rem)] mx-auto p-5 rounded-lg">
      <h1 className="text-xl font-bold mb-5">Users</h1>
      <DataTable
        data={users}
        columns={columns}
        caption="A list of registered users."
        actions={(user: User) => (
          <Link href={`/admin/users/${user._id}`}>
            <CodeOutlined className="text-2xl text-gray-600 group-hover:text-white" />
          </Link>
        )}
      />
    </div>
  );
};

export default UsersPage;
