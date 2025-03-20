import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button"; 
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

// Define the Expense interface
interface Expense {
  _id: string;
  amount: number;
  discription: string;
  createdAt: string;
  createdBy: {
    id: string;
    username: string;
  };
}

const ExpenseReport: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [updatedAmount, setUpdatedAmount] = useState<number>(0);
  const [updatedDescription, setUpdatedDescription] = useState<string>("");

  // Fetch expenses based on start and end date
  const fetchExpenses = useCallback(async () => {
    try {
      const response = await fetch("/api/Expense/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });
  
      if (!response.ok) throw new Error("Failed to fetch expenses");
  
      const data = await response.json();
      if (data.success) {
        setExpenses(data.data.expense || []);
      } else {
        setError(data.message || "No data found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [startDate, endDate]);

  // useEffect to call fetchExpenses whenever startDate or endDate changes
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleDeleteExpense = async (expenseId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this expense?");
    if (!confirmDelete) return;
    try {
      const response = await fetch(`/api/Expense/detail/${expenseId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expeId: expenseId }),
      });

      if (!response.ok) throw new Error("Failed to delete expense");

      setExpenses((prevExpenses) => prevExpenses.filter((exp) => exp._id !== expenseId));
      
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleUpdateExpense = async () => {
    if (!currentExpense) return;

    try {
      const response = await fetch(`/api/Expense/detail/${currentExpense._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expeId: currentExpense._id,
          amount: updatedAmount,
          discription: updatedDescription,
        }),
      });

      if (!response.ok) throw new Error("Failed to update expense");

      // Refresh the expense list
      fetchExpenses();
      setIsModalOpen(false); // Close the modal after updating
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const setPresetDates = (range: string) => {
    const today = new Date();
    let start = new Date();
  
    switch (range) {
      case "today":
        // Today remains today
        break;
  
      case "thisWeek":
        // Set start date to the most recent Monday (handle Sunday as 0, adjust accordingly)
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days
        start.setDate(today.getDate() - daysSinceMonday);
        break;
  
      case "oneMonth":
        // Set start date to the 1st of the current month
        start.setDate(1);
        break;
  
      case "threeMonths":
        // Go back 3 months and reset to the 1st day of that month
        start.setMonth(start.getMonth() - 3);
        start.setDate(1);
        break;
  
      case "sixMonths":
        // Go back 6 months and reset to the 1st day of that month
        start.setMonth(start.getMonth() - 6);
        start.setDate(1);
        break;
  
      case "oneyear":
        // Dynamically set to January 1st of the current year
        start = new Date(today.getFullYear(), 0, 1); // January 1st of the current year
        break;
  
      default:
        return;
    }
  
    // Ensure the dates are formatted as YYYY-MM-DD
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  };
  const openModal = (expense: Expense) => {
    setCurrentExpense(expense);
    setUpdatedAmount(expense.amount);
    setUpdatedDescription(expense.discription);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentExpense(null);
  };

  return (
    <div className="mt-24 ml-0 lg:ml-60 w-full max-w-4xl lg:max-w-[calc(100%-15rem)] mx-auto p-5 rounded-lg">
      <h1 className="text-xl font-bold mb-5">Expense Report</h1>
      
      <form className="mb-5">
        <div className="flex gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date:</label>
            <input
              type="date"
              id="startDate"
              className="border rounded-md p-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date:</label>
            <input
              type="date"
              id="endDate"
              className="border rounded-md p-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-4 mt-4 mb-4">
              <Button type="button" onClick={() => setPresetDates('today')} className="bg-gray-300 px-4 py-2 rounded">Today</Button>
              <Button type="button" onClick={() => setPresetDates('thisWeek')} className="bg-gray-300 px-4 py-2 rounded">This week</Button>
              <Button type="button" onClick={() => setPresetDates('oneMonth')} className="bg-gray-300 px-4 py-2 rounded">One Month</Button>
              <Button type="button" onClick={() => setPresetDates('threeMonths')} className="bg-gray-300 px-4 py-2 rounded">Three Months</Button>
              <Button type="button" onClick={() => setPresetDates('sixMonths')} className="bg-gray-300 px-4 py-2 rounded">Six Months</Button>
              <Button type="button" onClick={() => setPresetDates('oneyear')} className="bg-gray-300 px-4 py-2 rounded">One Year</Button>
            </div>
        <button type="button" onClick={fetchExpenses} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md">
          Fetch Expenses
        </button>
      </form>

      <Table>
        <TableCaption>A list of expenses.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map(({ _id, discription, amount, createdBy, createdAt }) => (
            <TableRow key={_id}>
              <TableCell>{discription}</TableCell>
              <TableCell>{amount.toFixed(2)}</TableCell>
              <TableCell>{createdBy.username}</TableCell>
              <TableCell>{new Date(createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button variant="ghost" className="mr-2" onClick={() => openModal({ _id, discription, amount, createdBy, createdAt })}>
                  <EditOutlined className="text-blue-500" />
                </Button>
                <Button variant="ghost" className="mr-2" onClick={() => handleDeleteExpense(_id)}>
                  <DeleteOutlined className="text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal for updating expense */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">Update Expense</h2>
            <div className="mb-4">
              <label htmlFor="updateDescription" className="block text-sm font-medium text-gray-700">Description:</label>
              <input
                type="text"
                id="updateDescription"
                className="border rounded-md p-2 w-full"
                value={updatedDescription}
                onChange={(e) => setUpdatedDescription(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="updateAmount" className="block text-sm font-medium text-gray-700">Amount:</label>
              <input
                type="number"
                id="updateAmount"
                className="border rounded-md p-2 w-full"
                value={updatedAmount}
                onChange={(e) => setUpdatedAmount(Number(e.target.value))} />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-400 text-white py-2 px-4 rounded-md mr-2"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-md"
                onClick={handleUpdateExpense}
              >
                Update Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseReport;
