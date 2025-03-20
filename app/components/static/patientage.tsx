"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { LabelList, Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { fetchPatientData } from "./api";


export default function PatientAgePieChart() {
  const [chartData, setChartData] = useState<{ label: string; total: number; fill?: string }[]>([]);

  useEffect(() => {
    async function fetchData() {
      const data = await fetchPatientData();
      if (data) {
        const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF", "#B4B4B4"];
        const formattedData = data.ageDistribution.map((item: any, index: number) => ({
          ...item,
          fill: colors[index % colors.length], // Assign a color to each category
        }));
        setChartData(formattedData);
      }
    }

    fetchData();
  }, []);

  const chartConfig: ChartConfig = {
    total: { label: "Patients" },
    ...chartData.reduce((acc, item) => {
      acc[item.label] = { label: item.label, color: item.fill };
      return acc;
    }, {} as ChartConfig),
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Patient Age Distribution</CardTitle>
        <CardDescription>Distribution of patients by age range</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[350px] [&_.recharts-text]:fill-background"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="total" hideLabel />} />
            <Pie data={chartData} dataKey="total">
              <LabelList dataKey="label" className="fill-background" stroke="none" fontSize={12} />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm ">
        <div className="flex items-center gap-2 font-medium leading-none">
          Patient distribution overview <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Data based on the latest patient records
        </div>
      </CardFooter>
    </Card>
  );
}