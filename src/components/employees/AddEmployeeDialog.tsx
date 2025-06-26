import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Plus, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import DepartmentDropdown from './DepartmentDropdown';
import RoleDropdown from './RoleDropdown';

// Define the employee schema using Zod
const employeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  roles: z.array(z.string()).optional(),
  employeeId: z.string()
    .min(1, 'Employee ID is required')
    .refine((val) => /^EMP[0-9]{1,4}$/.test(val), {
      message: "Employee ID must be in format: EMP1 or EMP0001 (EMP followed by 1-4 digits)"
    }),
  joiningDate: z.date(),
  salary: z.number().min(1000, 'Salary must be at least ₹1000'),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string()
      .optional()
      .refine((val) => !val || /^[1-9][0-9]{5}$/.test(val), {
        message: "Postal code must be a valid 6-digit Indian PIN code"
      }),
  }).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
  bankDetails: z
    .object({
      accountNumber: z.string()
        .optional()
        .refine((val) => !val || (val.length >= 9 && val.length <= 18 && /^\d+$/.test(val)), {
          message: "Account number must be 9-18 digits"
        }),
      bankName: z.string()
        .optional()
        .refine((val) => !val || (val.length >= 2 && val.length <= 100 && /^[a-zA-Z\s&.-]+$/.test(val)), {
          message: "Bank name must be 2-100 characters, letters only"
        }),
      ifscCode: z.string()
        .optional()
        .refine((val) => !val || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(val), {
          message: "IFSC code must be in format: ABCD0123456 (4 letters, 0, 6 alphanumeric)"
        }),
    })
    .optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  departmentId: z.string().optional(),
  isEdit: z.boolean().optional(), // Add flag to identify edit mode
}).superRefine((data, ctx) => {
  // Password validation for add mode
  if (!data.isEdit) {
    if (!data.password || data.password.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required",
        path: ["password"],
      });
    }
    if (!data.confirmPassword || data.confirmPassword.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Confirm password is required",
        path: ["confirmPassword"],
      });
    }
  }
  
  // Password matching validation - only if either password field has content
  if ((data.password && data.password.trim() !== '') || (data.confirmPassword && data.confirmPassword.trim() !== '')) {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });
    }
  }
});

// Infer the type for form values
export type EmployeeFormValues = z.infer<typeof employeeSchema>;

// Define props for the EmployeeForm component
interface EmployeeFormProps {
  initialData?: Partial<EmployeeFormValues>;
  onSubmit: (data: EmployeeFormValues) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

// EmployeeForm component
function EmployeeForm({ initialData, onSubmit, onCancel, isEdit = false }: EmployeeFormProps) {
  // State for departments and roles data
  const [departments, setDepartments] = useState<Array<{_id?: string, id?: string, name: string}>>([]);
  const [roles, setRoles] = useState<Array<{_id?: string, id?: string, name: string}>>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [nextEmployeeId, setNextEmployeeId] = useState('');
  const [isGeneratingId, setIsGeneratingId] = useState(false);

  // Fetch departments and roles data
  useEffect(() => {
    console.log('🔄 Component loaded, isEdit:', isEdit);
    
    const fetchData = async () => {
      try {
        const [deptResponse, roleResponse] = await Promise.all([
          fetch('http://localhost:8000/api/v1/departments', {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
          }),
          fetch('http://localhost:8000/api/v1/roles', {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
          })
        ]);

        const deptData = await deptResponse.json();
        const roleData = await roleResponse.json();

        // Handle the API response structure properly
        const departments = deptData.data || (Array.isArray(deptData) ? deptData : []);
        const roles = roleData.data || (Array.isArray(roleData) ? roleData : []);

        console.log('Parsed departments:', departments);
        console.log('Parsed roles:', roles);

        setDepartments(departments);
        setRoles(roles);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    
    // Generate next employee ID for add mode
    if (!isEdit) {
      console.log('🆔 Auto-generating Employee ID for add mode');
      // Add a small delay to ensure form is ready
      setTimeout(() => {
        generateNextEmployeeId();
      }, 100);
    }
  }, [isEdit]);

  // Normalize initialData to extract nested user and department fields if present
  const normalizedInitialData = { ...initialData };
  if (initialData && typeof initialData === 'object') {
    const user = (initialData as any).user;
    if (user) {
      if (!('firstName' in normalizedInitialData) && user.firstName) {
        (normalizedInitialData as any).firstName = user.firstName;
      }
      if (!('lastName' in normalizedInitialData) && user.lastName) {
        (normalizedInitialData as any).lastName = user.lastName;
      }
    }
    const department = (initialData as any).department;
    if (department && typeof department === 'object') {
      if (department.name) {
        (normalizedInitialData as any).department = department.name;
      }
    }
  }
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      roles: [],
      employeeId: '',
      joiningDate: new Date(),
      salary: 1000,
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
      bankDetails: {
        accountNumber: '',
        bankName: '',
        ifscCode: '',
      },
      password: '',
      confirmPassword: '',
      departmentId: '',
      isEdit: isEdit,
      ...normalizedInitialData,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Function to fetch address details from postal code
  const fetchAddressFromPostalCode = async (postalCode: string) => {
    if (!postalCode || postalCode.length < 5) return;
    
    setIsLoadingAddress(true);
    try {
      // Using Indian Postal Code API
      const response = await fetch(`https://api.postalpincode.in/pincode/${postalCode}`);
      const data = await response.json();
      
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        
        // Update form fields with fetched data
        form.setValue('address.city', postOffice.District || '');
        form.setValue('address.state', postOffice.State || '');
        form.setValue('address.country', 'India');
        
        toast({
          title: 'Address details fetched successfully!',
          description: `City: ${postOffice.District}, State: ${postOffice.State}`,
        });
      } else {
        toast({
          title: 'Invalid postal code',
          description: 'Please enter a valid Indian postal code',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      toast({
        title: 'Error fetching address',
        description: 'Unable to fetch address details. Please enter manually.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Function to generate next Employee ID
  const generateNextEmployeeId = async () => {
    console.log('🔄 Generating next Employee ID...');
    setIsGeneratingId(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/employees/next-id', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      
      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Full API Response:', JSON.stringify(data, null, 2));
      
      // Try different possible response structures
      let nextId = null;
      
      // Check various possible field names and structures
      if (data.nextEmployeeId) {
        nextId = data.nextEmployeeId;
        console.log('✅ Found nextEmployeeId:', nextId);
      } else if (data.nextId) {
        nextId = data.nextId;
        console.log('✅ Found nextId:', nextId);
      } else if (data.next_id) {
        nextId = data.next_id;
        console.log('✅ Found next_id:', nextId);
      } else if (data.employeeId) {
        nextId = data.employeeId;
        console.log('✅ Found employeeId:', nextId);
      } else if (data.id) {
        nextId = data.id;
        console.log('✅ Found id:', nextId);
      } else if (data.data && data.data.nextEmployeeId) {
        nextId = data.data.nextEmployeeId;
        console.log('✅ Found data.nextEmployeeId:', nextId);
      } else if (data.data && data.data.nextId) {
        nextId = data.data.nextId;
        console.log('✅ Found data.nextId:', nextId);
      } else if (data.data && data.data.next_id) {
        nextId = data.data.next_id;
        console.log('✅ Found data.next_id:', nextId);
      } else if (data.data && data.data.employeeId) {
        nextId = data.data.employeeId;
        console.log('✅ Found data.employeeId:', nextId);
      } else if (data.data && data.data.id) {
        nextId = data.data.id;
        console.log('✅ Found data.id:', nextId);
      } else if (typeof data === 'string') {
        nextId = data;
        console.log('✅ Response is direct string:', nextId);
      } else {
        console.log('❌ Available fields in response:', Object.keys(data));
        console.log('❌ Response data type:', typeof data);
      }
      
      if (!nextId) {
        throw new Error(`No next ID found in API response. Available fields: ${Object.keys(data).join(', ')}`);
      }
      
      console.log('✅ Final next Employee ID:', nextId);
      
      setNextEmployeeId(nextId);
      
      // Set the generated ID in the form if it's add mode
      if (!isEdit) {
        form.setValue('employeeId', nextId);
        console.log('📝 Set Employee ID in form:', nextId);
      }
      
      toast({
        title: 'Employee ID Generated',
        description: `Next available ID: ${nextId}`,
      });
      
    } catch (error) {
      console.error('❌ Error generating employee ID:', error);
      
      // Fallback to EMP0001 if API fails
      const fallbackId = 'EMP0001';
      console.log('🔄 Using fallback ID:', fallbackId);
      
      setNextEmployeeId(fallbackId);
      
      if (!isEdit) {
        form.setValue('employeeId', fallbackId);
        console.log('📝 Set fallback Employee ID in form:', fallbackId);
      }
      
      toast({
        title: 'Using default Employee ID',
        description: `Started with ${fallbackId} (API unavailable)`,
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingId(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(
        async (data) => { 
          console.log('✅ Form validation passed, submitting data:', data); 
          setIsSubmitting(true);
          try {
            // Convert department name to ID
            const selectedDepartment = departments.find(dept => dept.name === data.department);
            const departmentId = selectedDepartment ? (selectedDepartment._id || selectedDepartment.id) : '';

            // Convert role name to ID (assuming single role for now)
            const selectedRole = roles.find(role => role.name === (Array.isArray(data.roles) ? data.roles[0] : data.roles));
            const roleIds = selectedRole ? [(selectedRole._id || selectedRole.id)] : [];

            // Exclude confirmPassword from data
            const { confirmPassword, ...dataWithoutConfirmPassword } = data;

            // Create data with converted IDs
            const dataWithIds = {
              ...dataWithoutConfirmPassword,
              departmentId: departmentId || '', // Ensure it's always a string
              roles: roleIds.filter(Boolean) as string[] // Ensure it's string array
            };

            // Remove password from data if it's empty in edit mode
            if (isEdit && !dataWithIds.password) {
              delete dataWithIds.password;
            }

            await onSubmit(dataWithIds); 
          } finally {
            setIsSubmitting(false);
          }
        },
        (errors) => {
          console.error('❌ Form validation failed:', errors);
          toast({
            title: 'Form validation failed',
            description: 'Please check all required fields',
            variant: 'destructive'
          });
        }
      )} className="space-y-6 p-1">
        {/* Personal Information Section */}
        <div className="space-y-4 pb-2">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="+91 9876543210" 
                      {...field}
                      onChange={(e) => {
                        let value = e.target.value;
                        
                        // Remove all non-digits
                        const digitsOnly = value.replace(/\D/g, '');
                        
                        // If user starts typing without +91, add it
                        if (digitsOnly.length > 0 && !value.startsWith('+91')) {
                          if (digitsOnly.startsWith('91') && digitsOnly.length > 2) {
                            // If starts with 91, format as +91
                            value = '+91 ' + digitsOnly.substring(2);
                          } else {
                            // Add +91 prefix
                            value = '+91 ' + digitsOnly;
                          }
                        } else if (value.startsWith('+91')) {
                          // Format existing +91 number
                          const phoneDigits = digitsOnly.substring(2); // Remove 91
                          if (phoneDigits.length > 0) {
                            value = '+91 ' + phoneDigits;
                          } else {
                            value = '+91 ';
                          }
                        }
                        
                        // Limit to +91 + 10 digits
                        if (digitsOnly.length > 12) {
                          const limitedDigits = digitsOnly.substring(0, 12);
                          value = '+91 ' + limitedDigits.substring(2);
                        }
                        
                        field.onChange(value);
                      }}
                      maxLength={14} // +91 + space + 10 digits
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEdit ? 'New Password (optional)' : 'Password'}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder={isEdit ? "Leave empty to keep current password" : "Password"} 
                        {...field} 
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  {isEdit && (
                    <p className="text-sm text-gray-500 mt-1">
                      Only enter a password if you want to change it
                    </p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEdit ? 'Confirm New Password' : 'Confirm Password'}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder={isEdit ? "Confirm new password" : "Confirm Password"} 
                        {...field} 
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Employment Details Section */}
        <div className="space-y-4 pb-2">
          <h3 className="text-lg font-semibold">Employment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <DepartmentDropdown
                      value={field.value || ''}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <FormControl>
                    <RoleDropdown
                      value={Array.isArray(field.value) ? field.value[0] || '' : field.value || ''}
                      onChange={(e) => {
                        // Store role name, will be converted to ID later
                        const selectedRoleName = e.target.value;
                        if (selectedRoleName && selectedRoleName !== 'All') {
                          field.onChange([selectedRoleName]);
                        } else {
                          field.onChange([]);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="EMP1 or EMP0001" 
                      {...field}
                      onChange={(e) => {
                        // Auto-format the input to match EMP#### pattern
                        let value = e.target.value.toUpperCase();
                        
                        // Remove any non-alphanumeric characters except EMP
                        value = value.replace(/[^EMP0-9]/g, '');
                        
                        // Ensure it starts with EMP
                        if (!value.startsWith('EMP')) {
                          if (value.length > 0 && !'EMP'.startsWith(value)) {
                            value = 'EMP' + value.replace(/[^0-9]/g, '');
                          } else {
                            value = 'EMP';
                          }
                        }
                        
                        // Limit to EMP + 4 digits max
                        if (value.length > 7) {
                          value = value.substring(0, 7);
                        }
                        
                        field.onChange(value);
                      }}
                      maxLength={7}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-gray-500 mt-1">
                    
                    {!isEdit && nextEmployeeId && (
                      <span className="ml-2 text-blue-600">Next: {nextEmployeeId}</span>
                    )}
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="joiningDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Joining Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? (typeof field.value === 'string' ? field.value : field.value.toISOString().split('T')[0]) : ''}
                      onChange={e => {
                        const dateValue = e.target.value;
                        field.onChange(dateValue ? new Date(dateValue) : null);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1000"
                      min="1000"
                      step="1000"
                      value={field.value ?? ''}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum salary: ₹1,000
                  </p>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-4 pb-2">
          <h3 className="text-lg font-semibold">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter state" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="e.g. 110001" 
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ''); // Only digits
                          field.onChange(value);
                          
                          // Fetch address details when postal code is 6 digits
                          if (value.length === 6) {
                            fetchAddressFromPostalCode(value);
                          }
                        }}
                        maxLength={6}
                      />
                      {isLoadingAddress && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter 6-digit postal code to auto-fill city, state, and country
                  </p>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="space-y-4 pb-2">
          <h3 className="text-lg font-semibold">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="emergencyContact.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Contact Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emergencyContact.relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <FormControl>
                    <Input placeholder="Relationship" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emergencyContact.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+91 9876543210" 
                      {...field}
                      onChange={(e) => {
                        let value = e.target.value;
                        
                        // Remove all non-digits
                        const digitsOnly = value.replace(/\D/g, '');
                        
                        // If user starts typing without +91, add it
                        if (digitsOnly.length > 0 && !value.startsWith('+91')) {
                          if (digitsOnly.startsWith('91') && digitsOnly.length > 2) {
                            // If starts with 91, format as +91
                            value = '+91 ' + digitsOnly.substring(2);
                          } else {
                            // Add +91 prefix
                            value = '+91 ' + digitsOnly;
                          }
                        } else if (value.startsWith('+91')) {
                          // Format existing +91 number
                          const phoneDigits = digitsOnly.substring(2); // Remove 91
                          if (phoneDigits.length > 0) {
                            value = '+91 ' + phoneDigits;
                          } else {
                            value = '+91 ';
                          }
                        }
                        
                        // Limit to +91 + 10 digits
                        if (digitsOnly.length > 12) {
                          const limitedDigits = digitsOnly.substring(0, 12);
                          value = '+91 ' + limitedDigits.substring(2);
                        }
                        
                        field.onChange(value);
                      }}
                      maxLength={14} // +91 + space + 10 digits
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="space-y-4 pb-2">
          <h3 className="text-lg font-semibold">Bank Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bankDetails.accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. 1234567890123456" 
                      {...field}
                      onChange={(e) => {
                        // Only allow digits
                        const value = e.target.value.replace(/\D/g, '');
                        field.onChange(value);
                      }}
                      maxLength={18}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankDetails.bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. State Bank of India" 
                      {...field}
                      onChange={(e) => {
                        // Allow letters, spaces, &, ., -
                        const value = e.target.value.replace(/[^a-zA-Z\s&.-]/g, '');
                        field.onChange(value);
                      }}
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="bankDetails.ifscCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IFSC Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. SBIN0001234" 
                    {...field}
                    onChange={(e) => {
                      // Convert to uppercase and allow only letters and numbers
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      field.onChange(value);
                    }}
                    maxLength={11}
                    style={{ textTransform: 'uppercase' }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-6 pb-2 border-t border-gray-200 mt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding Employee...' : (initialData ? 'Update Employee' : 'Add Employee')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Define props for the AddEmployeeDialog component
interface AddEmployeeDialogProps {
  mode: 'add' | 'edit';
  employee?: EmployeeFormValues;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onEmployeeEdit?: (data: EmployeeFormValues) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

// AddEmployeeDialog component
export function AddEmployeeDialog({ 
  mode = 'add', 
  employee, 
  open,
  onOpenChange,
  onEmployeeEdit,
  onRefresh
}: AddEmployeeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  // Add a ref to reset the form after successful add
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (data: EmployeeFormValues) => {
    console.log('🚀 AddEmployeeDialog.handleSubmit called with:', data);
    try {
      // Exclude confirmPassword from API data
      const { confirmPassword, ...dataWithoutConfirmPassword } = data;
      
      // Transform the data to match API expectations exactly
      const apiData = {
        firstName: dataWithoutConfirmPassword.firstName,
        lastName: dataWithoutConfirmPassword.lastName,
        email: dataWithoutConfirmPassword.email,
        phone: dataWithoutConfirmPassword.phone || '',
        password: dataWithoutConfirmPassword.password,
        employeeId: dataWithoutConfirmPassword.employeeId,
        joiningDate: dataWithoutConfirmPassword.joiningDate instanceof Date 
          ? dataWithoutConfirmPassword.joiningDate.toISOString().split('T')[0]
          : String(dataWithoutConfirmPassword.joiningDate).split('T')[0],
        salary: typeof dataWithoutConfirmPassword.salary === 'string' ? Number(dataWithoutConfirmPassword.salary) : dataWithoutConfirmPassword.salary,
        roles: dataWithoutConfirmPassword.roles || [],
        departmentId: dataWithoutConfirmPassword.departmentId || '',
        address: dataWithoutConfirmPassword.address || {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: ''
        },
        emergencyContact: dataWithoutConfirmPassword.emergencyContact || {
          name: '',
          relationship: '',
          phone: ''
        },
        bankDetails: dataWithoutConfirmPassword.bankDetails || {
          accountNumber: '',
          bankName: '',
          ifscCode: ''
        },
      };
      
      console.log('📤 Sending API data:', apiData);
      
      if (mode === 'add') {
        // Make direct API call instead of using the service
        const response = await fetch('http://127.0.0.1:8000/api/v1/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify(apiData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Employee created successfully:', result);
        
        toast({ title: 'Employee added successfully!' });
        setDialogOpen(false);
        setFormKey(prev => prev + 1); // reset form
        
        // Call the refresh callback if provided
        if (onRefresh) {
          try {
            await onRefresh();
          } catch (error) {
            console.log('Refresh callback completed');
          }
        }
      } else if (onEmployeeEdit) {
        // For edit mode, use the callback
        await onEmployeeEdit(data);
      }
    } catch (error: any) {
      console.error('❌ Error adding employee:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        requestData: error?.config?.data
      });
      
      const errorMessage = error?.message || 'An error occurred while adding employee';
      
      toast({ 
        title: 'Failed to add employee', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    }
  };

  const handleAddEmployeeClick = () => {
    setDialogOpen(true);
  };

  return (
    <Dialog {...(open !== undefined ? { open: dialogOpen, onOpenChange: setDialogOpen } : {})}>
      {mode === 'add' && (
        <DialogTrigger asChild>
          <Button onClick={open !== undefined ? handleAddEmployeeClick : () => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle>{mode === 'add' ? 'Add New Employee' : 'Edit Employee'}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[75vh] overflow-y-auto pr-2 pb-4">
          <EmployeeForm
            key={formKey}
            initialData={employee}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            isEdit={mode === 'edit'}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}