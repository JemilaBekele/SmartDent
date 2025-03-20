"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button"


const ExpenseForm = () => {
  // State variables for form data
  const { data: session } = useSession();
    const role = useMemo(() => session?.user?.role || "", [session]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(1); // Default value from schema
 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/Expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discription: description,
          amount: amount,
          
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setMessage("Expense created successfully!");
        setDescription("");
        setAmount(200); // Reset to default value
       
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage("Error creating expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-16 min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h1 className="text-xl font-bold mb-4">Add New Expense</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div>
            <label className="block font-medium mb-2" htmlFor="description">
              Description
            </label>
            <input
              type="text"
              id="description"
              className="w-full p-2 border border-gray-300 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block font-medium mb-2" htmlFor="amount">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              className="w-full p-2 border border-gray-300 rounded"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>

          {/* CreatedBy */}
          

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Add Expense"}
            </button>
          </div>
        </form>
        {["reception", "admin"].includes(role) && (
        <Link href={`/${role}/expense/all`}>
        <Button type="button"  className="mt-7 bg-gray-200 "variant="ghost">Expense Report</Button>
        </Link>
)}
        {/* Message Display */}
        {message && <p className="mt-4 text-center p-2 bg-green-200 text-green-500">{message}</p>}
      </div>
    </div>
  );
};

export default ExpenseForm;
