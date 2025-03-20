import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table"; // Your design system components

interface Statistic {
  serviceId: string;
  serviceName: string;
  totalUsageCount: number;
  totalRevenue: number;
}

const StatisticsTable: React.FC = () => {
  const [rankByUsage, setRankByUsage] = useState<Statistic[]>([]);
  const [rankByRevenue, setRankByRevenue] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/statics/rankservice');
        const data = await response.json();

        if (data.success) {
          setRankByUsage(data.data.rankByUsage);
          setRankByRevenue(data.data.rankByRevenue);
        } else {
          setError(data.message || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex">
      <div className="flex-grow md:ml-60 container mx-auto p-4 bg-white rounded-lg shadow-md">
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Rankings by Usage</h2>
            <Table className="bg-white">
              <TableCaption>Ranked by service usage</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Rank</TableHead>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Total Usage Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankByUsage.map((stat, index) => (
                  <TableRow key={stat.serviceId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{stat.serviceName}</TableCell>
                    <TableCell>{stat.totalUsageCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Rankings by Revenue</h2>
            <Table className="bg-white">
              <TableCaption>Ranked by total revenue</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Rank</TableHead>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Total Revenue </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankByRevenue.map((stat, index) => (
                  <TableRow key={stat.serviceId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{stat.serviceName}</TableCell>
                    <TableCell>{stat.totalRevenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsTable;
