import React, { useEffect, useState } from 'react';

interface Department {
  _id?: string;
  id?: string;
  name: string;
  isActive?: boolean;
}

interface DepartmentDropdownProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

function DepartmentDropdown({ value, onChange, className }: DepartmentDropdownProps) {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/departments', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Fetched departments:', data);
        const departmentList = Array.isArray(data) ? data : data.data || [];
        // Filter out inactive departments
        const activeDepartments = departmentList.filter((dept: Department) => dept.isActive !== false);
        setDepartments(activeDepartments);
      })
      .catch(error => {
        console.error('Error fetching departments:', error);
      });
  }, []);

  return (
    <select
      value={value}
      onChange={onChange}
      className={`block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className || ''}`}
    >
      <option value="All">All Departments</option>
      {departments.map(dept => (
        <option key={dept._id || dept.id} value={dept.name}>
          {dept.name}
        </option>
      ))}
    </select>
  );
}

export default DepartmentDropdown; 