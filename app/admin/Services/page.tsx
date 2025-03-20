"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import ServicesPage from "@/app/components/admin/service";

type Service = {
  id?: string;
  service: string;
  price: number;
  categoryId: string;
};

type Category = {
  id: string;
  name: string;
};

type ApiService = {
  _id: string;
  service: string;
  price: number;
  categoryId: string | { _id: string };
};

type ApiCategory = {
  _id: string;
  name: string;
};

const ServiceForm = () => {
  const [serviceData, setServiceData] = useState<Service>({
    id: "",
    service: "",
    price: 0,
    categoryId: "",
  });

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          axios.get<ApiService[]>("/api/Invoice/Service"),
          axios.get<ApiCategory[]>("/api/Category"),
        ]);

        const normalizedServices = servicesRes.data.map((service: ApiService) => ({
          id: service._id,
          service: service.service,
          price: service.price,
          categoryId: typeof service.categoryId === "object" ? service.categoryId._id : service.categoryId,
        }));

        const normalizedCategories = categoriesRes.data.map((cat: ApiCategory) => ({
          id: cat._id,
          name: cat.name,
        }));

        setServices(normalizedServices);
        setCategories(normalizedCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setServiceData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = serviceData.id ? `/api/Invoice/Service/${serviceData.id}` : "/api/Invoice/Service";
    const method = serviceData.id ? "patch" : "post";

    try {
      const response = await axios[method](endpoint, serviceData);

      if (response.status === 200 || response.status === 201) {
        setMessage(serviceData.id ? "Service updated successfully!" : "Service added successfully!");
        setServiceData({ id: "", service: "", price: 0, categoryId: "" });

        const updatedService = {
          id: response.data.service._id,
          service: response.data.service.service,
          price: response.data.service.price,
          categoryId: response.data.service.categoryId,
        };

        setServices((prev) =>
          serviceData.id
            ? prev.map((s) => (s.id === serviceData.id ? updatedService : s))
            : [...prev, updatedService]
        );
      } else {
        setMessage("Failed to save service.");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      setMessage("Error saving service.");
    }
  };

  const handleEdit = (service: Service) => {
    setServiceData(service);
  };

  return (
    <div className="bg-gray-100 p-5 rounded-lg mt-13 ml-0 lg:ml-60 w-full max-w-4xl lg:max-w-[calc(100%-15rem)] mx-auto">
 
      <div className="p-6">
  
        <h2 className="text-2xl font-semibold mb-4">{serviceData.id ? "Edit Service" : "Add New Service"}</h2>

        {message && <p className="mb-4 text-green-500">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700">
              Service Name
            </label>
            <input
              type="text"
              name="service"
              value={serviceData.service}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={serviceData.price}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="categoryId"
              value={serviceData.categoryId}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {serviceData.id ? "Update Service" : "Add Service"}
            </button>
          </div>
        </form>
        <div className="text-left">
  <a
    href="/admin/Category"
    className="bg-gray-500 mt-5 text-white rounded-md py-2 px-4 inline-block"
  >
   Category
  </a>
  <a
    href="/admin/creaditorg"
    className="bg-gray-500 m-3 mt-5 text-white rounded-md py-2 px-4 inline-block"
  >
   Organizations Service
  </a>
  <a
    href="/admin/addorg"
    className="bg-gray-500 m-3 mt-5 text-white rounded-md py-2 px-4 inline-block"
  >
   Add Organization
  </a>
</div>
      </div>

      <ServicesPage services={services} setServices={setServices} onEdit={handleEdit} />
    </div>
  );
};

export default ServiceForm;
