"use client";
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from 'next-auth/react';

type User = {
  _id: string;
  cardno: string;
  firstname: string;
  age: string;
  sex: string;
  phoneNumber: string;
};

const UsersPage: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');

  // Memoized user role
  const role = useMemo(() => session?.user?.role || '', [session]);

  // Role-to-route mapping
  const roleToRouteMap: { [key: string]: string } = {
    User: "/user/{patientId}", // Placeholder for dynamic patient ID
    
  };

  // Debugging
  console.log("User Role:", role);
  console.log("Mapped Route:", roleToRouteMap[role]);

  const fetchUsers = async () => {
    if (!firstName) {
      setError("Please provide a first name.");
      setUsers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/app/patientfilter', { firstName });

      if (Array.isArray(response.data.data)) {
        setUsers(response.data.data);
      } else {
        setError('Unexpected data format received from server');
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError('No patients found');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="flex m-7">
      <div className="flex-grow md:ml-60 container mx-auto p-4">
        <h1 className="text-3xl font-extrabold text-center mt-10 text-gray-800 mb-6">Patient</h1>

        {/* Search Form */}
        <form className="mb-6" onSubmit={handleSearch}>
          <div className="flex space-x-4">
            <input
              type="text"
              className="border rounded p-2"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <button type="submit" className="bg-blue-500 text-white rounded p-2">
              Filter
            </button>
          </div>
        </form>

        {/* Error and loading messages */}
        {error && <div className="error mt-16">{error}</div>}
        {loading && <div className="loading mt-16">Loading...</div>}

        {/* Users Table */}
        {users.length > 0 && !loading && (
          <Table>
            <TableCaption>A list of Patients.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Card No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>Phone Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => {
                const route = roleToRouteMap[role]?.replace("{patientId}", user._id);
                
                return (
                  <TableRow
                    key={user._id}
                    onClick={() => {
                      if (route) {
                        router.push(route);
                      } else {
                        console.error(`No route found for role: ${role}`);
                      }
                    }}
                  >
                    <TableCell>{user.cardno}</TableCell>
                    <TableCell>{user.firstname}</TableCell>
                    <TableCell>{user.age}</TableCell>
                    <TableCell>{user.sex}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
