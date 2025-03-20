"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from '@/app/components/ui/Spinner';

const UserForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
    phone: "",
    image: null as File | null, // Allow image to be File or null
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "image" && e.target instanceof HTMLInputElement) {
        const inputElement = e.target;

        // Check if files exist
        if (inputElement.files && inputElement.files.length > 0) {
            const file = inputElement.files[0]; // Get the file safely
            setFormData((prevState) => ({
                ...prevState,
                image: file, // Set the selected file as the image
            }));
        }
    } else {
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    }
};





  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
  
    try {
      setLoading(true); 
      
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("role", formData.role);
      formDataToSend.append("phone", formData.phone);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }
      
      const res = await fetch("/api/register", {
        method: "POST",
        body: formDataToSend,
      });
  
      if (!res.ok) {
        const response = await res.json();
        setErrorMessage(response.message);
      } else {
        router.refresh();
        router.push("/admin");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div className="text-center"><Spinner/></div>;

  return (
    <div className=" bg-gray-100 p-5 rounded-lg mt-24 ml-0 lg:ml-60 w-full max-w-4xl lg:max-w-[calc(100%-15rem)] mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center" >Register</h1>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-6">
          <div className="w-full md:w-[48%]">
            <label className="block mb-2" htmlFor="username">Username</label>
            <input
              className="p-4 bg-[var(--bg)] text-[var(--text)] border-2 border-[#2e374a] rounded w-full"
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
              value={formData.username}
            />
          </div>
          <div className="w-full md:w-[48%]">
            <label className="block mb-2" htmlFor="password">Password</label>
            <input
              className="p-4 bg-[var(--bg)] text-[var(--text)] border-2 border-[#2e374a] rounded w-full"
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
              value={formData.password}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="w-full md:w-[48%]">
            <label className="block mb-2" htmlFor="role">Role</label>
            <select
              className="p-4 bg-[var(--bg)] text-[var(--text)] border-2 border-[#2e374a] rounded w-full"
              id="role"
              name="role"
              onChange={handleChange}
              required
              value={formData.role}
            >
              <option value="" disabled>Select Role</option>
              <option value="admin">Admin</option>
              <option value="reception">Reception</option>
              <option value="doctor">Doctor</option>
              <option value="User">User</option>
            </select>
          </div>
          <div className="w-full md:w-[48%]">
            <label className="block mb-2" htmlFor="phone">Phone</label>
            <input
              className="p-4 bg-[var(--bg)] text-[var(--text)] border-2 border-[#2e374a] rounded w-full"
              type="text"
              id="phone"
              name="phone"
              placeholder="Phone"
              onChange={handleChange}
              required
              value={formData.phone}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="w-full md:w-[48%]">
            <label className="block mb-2" htmlFor="image">Profile Image</label>
            <input
              className="p-4 bg-[var(--bg)] text-[var(--text)] border-2 border-[#2e374a] rounded w-full"
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            className="self-center mt-4 py-2 px-6 rounded-lg bg-gray-900 text-white shadow-md hover:shadow-lg hover:bg-gray-500 focus:opacity-85 active:opacity-85"
            type="submit"
          >
            Submit
          </button>
         
        </div>
      </form>
      {errorMessage && (
            <p className="mt-4 p-5 bg-red-100 text-red-500 text-base">{errorMessage}</p>
          )}
    </div>
  );
};

export default UserForm;
