"use client";
import React, { useEffect, useState ,useMemo} from 'react';
import Link from "next/link";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CodeOutlined, EditOutlined } from '@ant-design/icons';
import OrderUpdateModal from '@/app/components/patient/active/UpdateOrderModal';
import { useSession } from 'next-auth/react';
type Doctor = {
  username: string;
};

type Order = {
  _id: string;
  assignedDoctorTo: Doctor | null;
};

type Patient = {
  _id: string;
  firstname: string;
  cardno: string;
  sex: string;
  orders: Order[]; // Corrected the type to reflect the structure
};

const Home: React.FC = () => {
  const { data: session } = useSession(); 
  const [patientsWithOrders, setPatientsWithOrders] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const role = useMemo(() => session?.user?.role || '', [session]); 
  // Fetch patients with orders
  const fetchPatientsWithOrders = async () => {
    try {
      const response = await fetch('/api/patient/order/orderlist/active');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (data.success) {
        setPatientsWithOrders(data.data);
      } else {
        setError(data.error || "Unknown error occurred");
      }
    } catch (error) {
      setError("Error fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientsWithOrders();
    const intervalId = setInterval(fetchPatientsWithOrders, 20000); // Refresh every 20 seconds
    return () => clearInterval(intervalId);
  }, []);

  const handleEditOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrderId(null);
    fetchPatientsWithOrders(); // Refetch data after modal closes
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6 text-center">Active Patient Orders</h1>
      <Table>
        <TableCaption>A list of patients with active orders.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Name</TableHead>
            <TableHead>Card No</TableHead>
            <TableHead>Assigned Doctor</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Edit Order</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
  {patientsWithOrders && patientsWithOrders.length > 0 ? (
    patientsWithOrders.map((patient) => (
      <TableRow key={patient._id}>
        <TableCell>{patient.firstname}</TableCell>
        <TableCell>{patient.cardno}</TableCell>
        <TableCell>
          {patient.orders && patient.orders.length > 0
            ? patient.orders[0].assignedDoctorTo?.username || "No Doctor Assigned"
            : "No Doctor Assigned"}
        </TableCell>
        <TableCell>
          {role === 'reception' && (
            <Link href={`/reception/card/all/${patient._id}`}>
              <CodeOutlined className="text-2xl text-gray-600 hover:bg-slate-900 group-hover:text-white" />
            </Link>
          )}
          {role === 'doctor' && (
            <Link href={`/doctor/medicaldata/medicalhistory/all/${patient._id}`}>
              <CodeOutlined className="text-2xl text-gray-600 hover:bg-slate-900 group-hover:text-white" />
            </Link>
          )}
        </TableCell>
        <TableCell>
          {patient.orders && patient.orders.length > 0 ? (
            <button
              onClick={() => handleEditOrder(patient.orders[0]._id)}
              className="ml-2 text-blue-600 hover:bg-slate-500"
              aria-label="button"
            >
              <EditOutlined />
            </button>
          ) : (
            <span>No Orders</span>
          )}
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={5} className="text-center">
        No active orders found.
      </TableCell>
    </TableRow>
  )}
</TableBody>

      </Table>
      {selectedOrderId && (
        <OrderUpdateModal
          isOpen={isModalOpen}
          onClose={closeModal}
          orderId={selectedOrderId}
        />
      )}
    </div>
  );
};

export default Home;