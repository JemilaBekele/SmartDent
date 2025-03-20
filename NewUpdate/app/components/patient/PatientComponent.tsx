import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { DownOutlined } from '@ant-design/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,

  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
type Organization = {
  _id: string;
  organization: string;
};

type Healthinfo = {
  _id:string
  allergies: string;
};

type Patient = {
  _id: string;
  cardno?: string;
  firstname?: string;
  age?: string;
  sex?: string;
  phoneNumber?: string;
  Town?: string;
  KK?: string;
  HNo?: string;
  description?: string;
  Region: string;
  Woreda: string;
  disablity: boolean;
  credit?:boolean;
  createdAt?: string;
  Orgnazation: Organization[]; 
  Healthinfo: Healthinfo[];
};


type PatientDetailsProps = {
  params: {
    id: string;
  };
};

const PatientComponent: React.FC<PatientDetailsProps> = ({ params }) => {
  const patientId = params.id;
  const { data: session } = useSession();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = useMemo(() => session?.user?.role || '', [session]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/api/patient/registerdata/${patientId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setPatient(response.data);
        console.log(response.data)
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Error fetching user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [patientId]);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!patient) return <div>Patient not found</div>;

  const renderDetail = (label: string, value?: string) => {
    if (value) {
      return (
        <div className="flex flex-col mb-4">
          <h2 className="font-semibold text-gray-600">{label}</h2>
          <p className="text-gray-800">{value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white h-auto p-4 rounded-lg shadow-md">
      <div className="flex bg-white flex-col items-center space-y-4">
      <div className="text-center space-y-2">
  {/* Patient Name */}
  <h1 className="text-xl font-bold capitalize">{patient.firstname}</h1>

  {/* Patient Details */}
  <p className="text-gray-600">{patient.phoneNumber}</p>
  <p className="text-gray-600">{patient.age} yrs</p>
  
  {/* Patient Status (Credit & Disability) */}
  {(patient.credit || patient.disablity) && (
    <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-md inline-block">
      {patient.credit && <span>Credit</span>}
    
    </div>
  )}

  {/* Date of Registration */}
  <p className="text-gray-600">
    {new Date(patient.createdAt || "").toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}
  </p>
  {patient.Orgnazation && patient.Orgnazation.length > 0 && (
            <div className="mt-2 p-2 bg-blue-100 text-blue-800 border border-blue-300 rounded-md inline-block">
              <span>Organization: {patient.Orgnazation[0].organization}</span>
            </div>
          )}
         
 
 {patient.Healthinfo &&
  patient.Healthinfo.length > 0 &&
  patient.Healthinfo.filter(info => info.allergies).length > 0 && (
    <div className="mt-2 p-2 bg-red-100 text-red-800 border border-red-300 rounded-md flex flex-wrap gap-2">
      <span className="font-semibold">Allergies:</span>
      {patient.Healthinfo.filter(info => info.allergies).map((info, index) => (
        <span
          key={info._id.toString()}
          className="underline decoration-red-500 px-2"
        >
          {info.allergies}
        </span>
      ))}
    </div>
  )}


</div>

        
        <div className="p-4 rounded-lg shadow-md w-full max-h-64 overflow-y-auto">
          {renderDetail('Card No', patient.cardno)}
          {renderDetail('Sex', patient.sex)}
          {renderDetail('Town', patient.Town)}
          {renderDetail('K/K', patient.KK)}
          {renderDetail('House No', patient.HNo)}
          {renderDetail('Description', patient.description)}
          {renderDetail('Region', patient.Region)}
          {renderDetail('Woreda', patient.Woreda)}
        </div>

        {/* Links Based on Role */}
        {role === "admin" && (
        <>
         
          <DropdownMenu>
            <DropdownMenuTrigger className="bg-gray-500 text-white px-4 py-2 rounded-md">
              <span> Dental records</span>
              <DownOutlined />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto bg-white shadow-lg rounded-md p-2">
             
              <DropdownMenuSeparator />
              {[
                { label: "Dental Records", href: `/admin/medicaldata/medicalhistory/all/${patientId}` },
                { label: "Health Information", href: `/admin/medicaldata/healthinfo/all/${patientId}` },
                { label: "Consent", href: `/admin/Consent/all/${patientId}` },
                { label: "Orthodontics", href: `/admin/Orthodontics/all/${patientId}` },
                { label: "Prescriptions", href: `/admin/prescriptions/all/${patientId}` },
                { label: "Medical Certificate", href: `/admin/medicalcertificate/all/${patientId}` },
                { label: "Referral", href: `/admin/referral/all/${patientId}` },
                { label: "FNA or Biosy Request ", href: `/admin/FNA/all/${patientId}` },
              ].map(({ label, href }) => (
                <DropdownMenuItem asChild key={label}>
                  <Link
                    href={href}
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-200 text-gray-600 rounded-lg shadow-md transition"
                  >
                    <span className="text-lg p-2 ">{label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div >
            {[
              { label: "All Invoices", href: `/admin/finace/Invoice/all/${patientId}` },
              { label: "Card", href: `/admin/card/all/${patientId}` },
              { label: "Appointments", href: `/admin/medicaldata/appointment/all/${patientId}` },
              { label: "Images", href: `/admin/medicaldata/image/all/${patientId}` },
              { label: "Credit", href: `/admin/creadit/all/${patientId}` },
              { label: "Organization", href: `/admin/organization/all/${patientId}` },
    
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="w-full flex items-center justify-between mb-3 bg-gray-100 hover:bg-gray-200 text-gray-600 p-4 rounded-lg shadow-md transition"
              >
                <span >{label}</span>
              </Link>
            ))}
          </div>
        </>
      )}



        {role === 'reception' && (
          <>
            <Link
              href={`/reception/card/all/${patientId}`}
              className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-600 p-4 rounded-lg shadow-md transition"
            >
              <span>Card</span>
            </Link>
            <Link
              href={`/reception/medicaldata/medicalhistory/all/${patientId}`}
              className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-600 p-4 rounded-lg shadow-md transition"
            >
              <span>Dental Record</span>
            </Link>
            <Link
              href={`/reception/Consent/all/${patientId}`}
              className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-600 p-4 rounded-lg shadow-md transition"
            >
              <span>Consent</span>
            </Link>
            <Link
              href={`/reception/appointment/all/${patientId}`}
              className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-600 p-4 rounded-lg shadow-md transition"
            >
              <span>Appointments</span>
            </Link>
            <Link
              href={`/reception/allinvoice/all/${patientId}`}
              className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-600 p-4 rounded-lg shadow-md transition"
            >
              <span>Invoice</span>
            </Link>
            <Link
              href={`/reception/image/all/${patientId}`}
              className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-600 p-4 rounded-lg shadow-md transition"
            >
              <span>Images</span>
            </Link>
            <Link
              href={`/reception/organization/all/${patientId}`}
              className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-600 p-4 rounded-lg shadow-md transition"
            >
              <span>Add Credit Organization</span>
            </Link>
            <Link
              href={`/reception/creadit/all/${patientId}`}
              className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-600 p-4 rounded-lg shadow-md transition"
            >
              <span>Credit</span>
            </Link>
            <Link
            href={`/reception/prescriptions/all/${patientId}`}
              className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-600 p-4 rounded-lg shadow-md transition"
            >
              <span>Prescriptions

              </span>
            </Link>
            <Link
              href={`/reception/medicalcertificate/all/${patientId}`}
              className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-600 p-4 rounded-lg shadow-md transition"
            >
              <span>Medical Certificate</span>
            </Link>
            <Link
              href={`/reception/Orthodontics/all/${patientId}`}
              className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-600 p-4 rounded-lg shadow-md transition"
            >
              <span>Orthodontic Record</span>
            </Link>
            <Link
              href={`/reception/referral/all/${patientId}`}
              className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-600 p-4 rounded-lg shadow-md transition"
            >
              <span>Referral</span>
            </Link>
            <Link
              href={`/reception/FNA/all/${patientId}`}
              className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-600 p-4 rounded-lg shadow-md transition"
            >
              <span>FNA</span>
            </Link>
          </>
        )}

{role === "doctor" && (<>
        <DropdownMenu>
          <DropdownMenuTrigger className="bg-gray-500 text-white px-4 py-2 rounded-md">
         Dental records <DownOutlined/>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto bg-white shadow-lg rounded-md p-2">
         
            <DropdownMenuSeparator />
            {[
              { label: "Dental Records", href: `/doctor/medicaldata/medicalhistory/all/${patientId}` },
              { label: "Orthodontics", href: `/doctor/Orthodontics/all/${patientId}` },
              { label: "Prescriptions", href: `/doctor/prescriptions/all/${patientId}` },
              { label: "Consent", href: `/doctor/Consent/all/${patientId}` },
              { label: "Medical Certificate", href: `/doctor/medicalcertificate/all/${patientId}` },
              { label: "Health Information", href: `/doctor/medicaldata/healthinfo/all/${patientId}` },
              { label: "Referral", href: `/doctor/referral/all/${patientId}` },
              { label: "FNA or Biosy Request ", href: `/doctor/FNA/all/${patientId}` },
            ].map(({ label, href }) => (
              <DropdownMenuItem asChild key={label}>
           <Link
                    href={href}
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-200 text-gray-600 rounded-lg shadow-md transition"
                  >
                    <span className="text-lg p-2 ">{label}</span>
                  </Link>

         
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="mb-4 space-y-2">
        {[
          { label: "Appointments", href: `/doctor/medicaldata/appointment/all/${patientId}` },
          { label: "Invoice", href: `/doctor/Invoice/all/${patientId}` },
          { label: "Images", href: `/doctor/medicaldata/image/all/${patientId}` },
          { label: "Credit", href: `/doctor/creadit/all/${patientId}` },

        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
           className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-600 p-6 rounded-lg shadow-md transition"
          >
            <span>{label}</span>
          </Link>
        ))}
      </div>
      </>
      )}
      </div>
    </div>
  );
};

export default PatientComponent;
