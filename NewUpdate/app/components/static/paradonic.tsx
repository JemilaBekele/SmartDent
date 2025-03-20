"use client";

import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import '@/app/components/ui/DataTable.css';
import { useRouter } from 'next/navigation';
import { CodeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Modal, Box, Typography } from '@mui/material';

// Define interfaces for patient data
interface Patient {
  _id: string;
  cardno: string;
  firstname: string;
  lastname: string;
  age: number;
  sex: string;
  invoiceHistory: Invoice[];
  creditHistory: Credit[];
}

interface Invoice {
  totalAmount: number;
  amount: number;
  createdAt: string;
}

interface Credit {
  totalAmount: number;
  amount: number;
  createdAt: string;
}

interface DataRow {
  id: number;
  ID: string;
  cardno: string;
  firstName: string;
  age: number;
  sex: string;
}

const ParadonicDataTable: React.FC = () => {
  const [rows, setRows] = useState<DataRow[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/statics/priodomant', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const { data }: { data: Patient[] } = await response.json();

        setRows(
          data.map((patient, index) => ({
            id: index + 1,
            ID: patient._id,
            cardno: patient.cardno,
            firstName: patient.firstname,
            age: patient.age,
            sex: patient.sex,
          }))
        );
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };

    fetchPatients();
  }, []);

  const handleViewDetails = (row: DataRow) => {
    router.push(`/admin/finace/Invoice/all/${row.ID}`);
  };

  const handleShowModal = async (row: DataRow) => {
    try {
      const response = await fetch('/api/statics/ortho', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patientId: row.ID }),
      });

      const result: { success: boolean; data: Patient; message?: string } = await response.json();

      if (result.success) {
        setSelectedPatient(result.data);
        setIsModalOpen(true);
      } else {
        console.error('Error fetching patient details:', result.message);
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
  };

  const columns: GridColDef[] = [
    { field: 'cardno', headerName: 'Card No', flex: 1 },
    { field: 'firstName', headerName: 'First Name', flex: 1 },
    { field: 'sex', headerName: 'Sex', flex: 0.5 },
    { field: 'age', headerName: 'Age', flex: 0.5 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      renderCell: (params) => (
        <>
          <CodeOutlined className="text-2xl pr-2 text-gray-600 group-hover:text-white" onClick={() => handleViewDetails(params.row)} />
          <InfoCircleOutlined className="text-2xl text-gray-600 group-hover:text-white" onClick={() => handleShowModal(params.row)} />
        </>
      ),
    },
  ];

  return (
    <div className="flex-1 ml-60">
      <div className="mt-16 p-6">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">Prosthodontics Patients</h1>
        <div className="data-table">
          <DataGrid rows={rows} columns={columns} pageSizeOptions={[20, 40, 100]} />
        </div>
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} aria-labelledby="patient-details-title" aria-describedby="patient-details-description">
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, maxHeight: '80vh', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4, overflowY: 'auto' }}>
            <Typography id="patient-details-title" variant="h6" component="h2">Patient Details</Typography>
            {selectedPatient ? (
              <Box id="patient-details-description" mt={2}>
                <Typography><strong>Name:</strong> {selectedPatient?.firstname} </Typography>
                <Typography><strong>Card No:</strong> {selectedPatient?.cardno}</Typography>
                <Typography variant="subtitle1" mt={2}>Invoice History</Typography>
                {selectedPatient.invoiceHistory.map((invoice, index) => (
                  <Box key={index} mt={1}>
                    <Typography><strong>Total Amount:</strong> {invoice?.totalAmount}</Typography>
                    <Typography><strong>Amount:</strong> {invoice?.amount}</Typography>
                    <Typography><strong>Date:</strong> {new Date(invoice?.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                ))}
                <Typography variant="subtitle1" mt={2}>Credit History</Typography>
                {selectedPatient.creditHistory.map((credit, index) => (
                  <Box key={index} mt={1}>
                    <Typography><strong>Total Amount:</strong> {credit?.totalAmount}</Typography>
                    <Typography><strong>Amount:</strong> {credit?.amount}</Typography>
                    <Typography><strong>Date:</strong> {new Date(credit?.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography>Loading...</Typography>
            )}
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default ParadonicDataTable;
