"use client";

import InvoiceForm from '@/app/components/medicaldata/Invoice/recpadd';
import { Suspense } from 'react';


// Import Spinner component

type InvoiceFormProps = {
  params: {
    id: string;
  };
};
export default function Home({ params }: InvoiceFormProps) {
  

  // Once loading is complete, render the actual content
  return (

    <div >
      <Suspense fallback={<div>Loading...</div>}>
      
      <InvoiceForm params={params} />
      </Suspense>
  
      
    </div>
  );
}
