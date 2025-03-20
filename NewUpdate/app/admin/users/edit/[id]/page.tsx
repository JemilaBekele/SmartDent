"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Spinner from "@/app/components/ui/Spinner";

type UserDetailsProps = {
  params: {
    id: number;
  };
};

const EditUser: React.FC<UserDetailsProps> = ({ params }) => {
  const userId = params.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    role: "",
  });

  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/see/${userId}`);
          setFormData({
            username: response.data.username,
            phone: response.data.phone,
            role: response.data.role,
          });
        } catch (err) {
          console.error("Error fetching user:", err);
          setError("Error fetching user details.");
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
        const formDataToSend = new FormData();
        formDataToSend.append("username", formData.username);
        formDataToSend.append("phone", formData.phone);
        formDataToSend.append("role", formData.role);

        const response = await axios.patch(`/api/see/${userId}`, formDataToSend);

        if (response.status === 200) {
            router.push("/admin/users");
        } else {
            console.error("Failed to update user.");
            setError("Failed to update user.");
        }
    } catch (err) {
        console.error("Error updating user:", err);
        setError( "Error updating user details.");
    }
};


  if (loading) return <div className="text-center"><Spinner /></div>;


  return (
    <div className="bg-gray-100 p-5 rounded-lg mt-24 ml-0 lg:ml-60 w-full max-w-4xl lg:max-w-[calc(100%-15rem)] mx-auto">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-6">
          <div className="w-full md:w-[48%]">
            <label className="block mb-2" htmlFor="username">Username</label>
            <input
              className="p-4 bg-[var(--bg)] text-[var(--text)] border-2 border-[#2e374a] rounded w-full"
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="w-full md:w-[48%]">
            <label className="block mb-2" htmlFor="role">Role</label>
            <select
              className="p-4 bg-[var(--bg)] text-[var(--text)] border-2 border-[#2e374a] rounded w-full"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select Role</option>
              <option value="admin">Admin</option>
              <option value="reception">Reception</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="w-full md:w-[48%]">
            <label className="block mb-2" htmlFor="phone">Phone</label>
            <input
              className="p-4 bg-[var(--bg)] text-[var(--text)] border-2 border-[#2e374a] rounded w-full"
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>
       
        <div className="flex justify-center mt-4">
          <button
            className="self-center mt-4 py-2 px-6 rounded-lg bg-gray-900 text-white shadow-md hover:shadow-lg hover:bg-gray-500 focus:opacity-85 active:opacity-85"
            type="submit"
          >
            Update
          </button>
          
        </div>
      </form>
      {error && (
            <p className="mt-4 p-2 text-red-500 bg-red-200 text-sm">{error}</p>
          )}
    </div>
  );
};

export default EditUser;
