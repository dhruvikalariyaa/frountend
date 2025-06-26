import React, { useEffect, useState } from 'react';

interface Role {
  _id?: string;
  id?: string;
  name: string;
}

interface RoleDropdownProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

function RoleDropdown({ value, onChange, className }: RoleDropdownProps) {
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/roles', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Fetched roles:', data);
        setRoles(Array.isArray(data) ? data : data.data || []);
      })
      .catch(error => {
        console.error('Error fetching roles:', error);
      });
  }, []);

  return (
    <select
      value={value}
      onChange={onChange}
      className={`block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className || ''}`}
    >
      <option value="All">All Roles</option>
      {roles.map(role => (
        <option key={role._id || role.id} value={role.name}>
          {role.name}
        </option>
      ))}
    </select>
  );
}

export default RoleDropdown; 