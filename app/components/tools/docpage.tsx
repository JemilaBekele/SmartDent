"use client";
import React from "react";
import SideNavbar from "./sidebar";
import { ContainerOutlined,  ProjectOutlined, SolutionOutlined } from '@ant-design/icons';

const items= [
  { label: "Dashboard", icon: <ProjectOutlined/>, link: "/doctor" },
  { label: "Appointment", icon: <SolutionOutlined />, link: "/doctor/filterapp" },
  { label: "Recent Patient", icon: <SolutionOutlined />, link: "/doctor/history" },
  { label: "Disease", icon: <ContainerOutlined/>, link: "/doctor/Disease/all" },
  { label: "Profile", icon: <ContainerOutlined/>, link: "/doctor/profile" },
  

  
];

const Docpage: React.FC = () => {
  return (
    <div>
      <SideNavbar items={items} />
      {/* Other page content */}
    </div>
  );
};

export default Docpage;
