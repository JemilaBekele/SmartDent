

import TodayAppointments from './dateappointment/TodayAppointments'
import UnconfirmedInvoices from '@/app/components/invoice/dashboard/listconfirminvoice'
import ActiveOrders from './active/activepatient';
import TomorrowAppointments from './dateappointment/tomorrow';
const PatientDashboard = () => {
  return (
    <div className="min-h-screen flex">
     
      <div className="flex-1 ml-60 p-10 bg-gray-100"> {/* Adjust margin to make room for sidebar */}
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
       
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-6xl">
          
        <div className="bg-white shadow-sm rounded-lg  flex flex-col items-center justify-center text-center">
        <ActiveOrders/></div>
        <div className="bg-white shadow-sm rounded-lg  flex flex-col items-center justify-center text-center">
<TodayAppointments/>
        </div>
        </div>
        <div className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-6xl">
        
        <div className="bg-white shadow-sm rounded-lg  flex flex-col items-center justify-center text-center">
        <UnconfirmedInvoices/></div>
        <div className="bg-white shadow-sm rounded-lg  flex flex-col items-center justify-center text-center">
<TomorrowAppointments/>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
