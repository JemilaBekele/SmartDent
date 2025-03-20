"use client";


import * as React from 'react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import '@/app/components/ui/DataTable.css';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { CodeOutlined } from '@ant-design/icons';

// Define an interface for the patient data
interface Patient {
  _id: string;
  cardno: string;
  firstname: string;
  lastname: string;
  age: number;
  phoneNumber: string;
  email: string;
  sex: string;
}

interface DataRow {
  id: number; // Unique ID for DataGrid
  ID: string;
  cardno: string;
  firstName: string;
 
  age: number;
  phoneNumber: string;
  email: string;
  sex: string;
}

const DataTable: React.FC = () => {
  const [rows, setRows] = useState<DataRow[]>([]);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/patient/registerdata', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data: Patient[] = await response.json();
        
        setRows(data.map((patient: Patient, index: number) => ({
          id: index + 1,
          ID: patient._id,
          cardno: patient.cardno,
          firstName: patient.firstname,
         
          age: patient.age,
          phoneNumber: patient.phoneNumber,
          email: patient.email,
          sex: patient.sex,
        })));
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };

    fetchPatients();
  }, []);

  const handleViewDetails = (row: DataRow) => {
    // Navigate to the patient details page or handle the view details logic
    router.push(`/admin/finace/Invoice/all/${row.ID}`);
  };

  const columns: GridColDef[] = [
    { field: 'cardno', headerName: 'Card No', flex: 1 },
    { field: 'firstName', headerName: 'firstName', flex: 1  },
  
    { field: 'phoneNumber', headerName: 'Phone Number', flex: 1  },
    { field: 'sex', headerName: 'Sex', flex: 1  },
    { field: 'age', headerName: 'Age', flex: 1 },  
   
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      getActions: (params: { row: DataRow }) => [
        <GridActionsCellItem
          key={`view-${params.row.id}`}
          icon={<CodeOutlined className="text-2xl text-gray-600 group-hover:text-white" />} // You can use any icon or text here
          label="View"
          onClick={() => handleViewDetails(params.row)}
        />
      ],
    },
  ];

  return (                                
    <div className="flex-1 ml-60">
      <div className="mt-16 p-6">
      <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">All Patients</h1>
   
        <div className="data-table">
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 20 },
              },
            }}
            pageSizeOptions={[20, 40,100]}
          />
        </div>

    

      </div>
    </div>
  );
};

export default DataTable;
