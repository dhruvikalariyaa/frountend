import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
  Award,
  Code2,
  Server,
  Smartphone,
  Cloud,
  Shield,
  LineChart,
  Edit2,
  Save,
  X,
  Camera,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Github,
  Calendar,
  Briefcase,
  FileText,
  Plus,
  UserCog,
  Clock,
  User
} from 'lucide-react';

// Company Information
const initialCompanyInfo = {
  name: "Dvij Infotech LLP",
  founded: "2020",
  type: "Information Technology",
  size: "50-100 employees",
  location: "Mumbai, Maharashtra, India",
  website: "www.dvijinfotech.com",
  email: "contact@dvijinfotech.com",
  phone: "+91 22 1234 5678",
  address: "123 Tech Park, Andheri East, Mumbai - 400093",
  description: "Dvij Infotech LLP is a leading IT solutions provider specializing in custom software development, cloud services, and digital transformation. We help businesses leverage technology to achieve their goals and stay ahead in the digital age.",
  socialLinks: {
    linkedin: 'https://linkedin.com/company/dvijinfotech',
    twitter: 'https://twitter.com/dvijinfotech',
    facebook: 'https://facebook.com/dvijinfotech',
    instagram: 'https://instagram.com/dvijinfotech',
    github: 'https://github.com/dvijinfotech'
  }
};

// Services
const initialServices = [
  {
    title: "Custom Software Development",
    icon: <Code2 className="h-6 w-6 text-blue-600" />,
    description: "Tailored software solutions designed to meet your specific business needs and challenges.",
  },
  {
    title: "Cloud Services",
    icon: <Cloud className="h-6 w-6 text-purple-600" />,
    description: "Comprehensive cloud solutions including migration, management, and optimization.",
  },
  {
    title: "Mobile App Development",
    icon: <Smartphone className="h-6 w-6 text-green-600" />,
    description: "Native and cross-platform mobile applications for iOS and Android devices.",
  },
  {
    title: "DevOps & Infrastructure",
    icon: <Server className="h-6 w-6 text-orange-600" />,
    description: "End-to-end DevOps solutions and infrastructure management services.",
  },
  {
    title: "Cybersecurity",
    icon: <Shield className="h-6 w-6 text-red-600" />,
    description: "Advanced security solutions to protect your digital assets and data.",
  },
  {
    title: "Business Intelligence",
    icon: <LineChart className="h-6 w-6 text-indigo-600" />,
    description: "Data analytics and business intelligence solutions for informed decision-making.",
  },
];

// Achievements
const initialAchievements = [
  {
    year: "2023",
    title: "Best IT Service Provider",
    organization: "Tech Excellence Awards",
  },
  {
    year: "2023",
    title: "Top 10 Cloud Solutions Provider",
    organization: "Cloud Computing Magazine",
  },
  {
    year: "2022",
    title: "Excellence in Innovation",
    organization: "Digital Transformation Summit",
  },
  {
    year: "2022",
    title: "Best Workplace",
    organization: "Great Place to Work",
  },
];

// Team Structure
const initialTeamStructure = {
  leadership: [
    { role: "CEO", name: "Rajesh Kumar", experience: "15+ years" },
    { role: "CTO", name: "Priya Sharma", experience: "12+ years" },
    { role: "COO", name: "Amit Patel", experience: "10+ years" },
  ],
  departments: [
    { name: "Software Development", size: "25" },
    { name: "Cloud & DevOps", size: "15" },
    { name: "Quality Assurance", size: "10" },
    { name: "Project Management", size: "8" },
    { name: "Business Development", size: "7" },
  ],
};

export default function CompanyProfile() {
  const [companyInfo, setCompanyInfo] = useState(initialCompanyInfo);
  const [services, setServices] = useState(initialServices);
  const [achievements, setAchievements] = useState(initialAchievements);
  const [teamStructure, setTeamStructure] = useState(initialTeamStructure);
  const [isEditing, setIsEditing] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New state for adding items
  const [newService, setNewService] = useState({ title: '', description: '', icon: <Code2 className="h-6 w-6" /> });
  const [newAchievement, setNewAchievement] = useState({ year: '', title: '', organization: '' });
  const [newLeader, setNewLeader] = useState({ role: '', name: '', experience: '' });
  const [newDepartment, setNewDepartment] = useState({ name: '', size: '' });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
        toast.success('Company logo updated successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    // Here you would typically make an API call to save all the data
    toast.success('Company profile updated successfully');
    setIsEditing(false);
  };

  const handleAddService = () => {
    if (newService.title.trim() && newService.description.trim()) {
      setServices([...services, newService]);
      setNewService({ title: '', description: '', icon: <Code2 className="h-6 w-6" /> });
      toast.success('Service added successfully');
    }
  };

  const handleAddAchievement = () => {
    if (newAchievement.title.trim() && newAchievement.organization.trim() && newAchievement.year.trim()) {
      setAchievements([...achievements, newAchievement]);
      setNewAchievement({ year: '', title: '', organization: '' });
      toast.success('Achievement added successfully');
    }
  };

  const handleAddLeader = () => {
    if (newLeader.role.trim() && newLeader.name.trim() && newLeader.experience.trim()) {
      setTeamStructure({
        ...teamStructure,
        leadership: [...teamStructure.leadership, newLeader]
      });
      setNewLeader({ role: '', name: '', experience: '' });
      toast.success('Leader added successfully');
    }
  };

  const handleAddDepartment = () => {
    if (newDepartment.name.trim() && newDepartment.size.trim()) {
      setTeamStructure({
        ...teamStructure,
        departments: [...teamStructure.departments, newDepartment]
      });
      setNewDepartment({ name: '', size: '' });
      toast.success('Department added successfully');
    }
  };

  const handleRemoveService = (index: number) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
    toast.success('Service removed successfully');
  };

  const handleRemoveAchievement = (index: number) => {
    const newAchievements = achievements.filter((_, i) => i !== index);
    setAchievements(newAchievements);
    toast.success('Achievement removed successfully');
  };

  const handleRemoveLeader = (index: number) => {
    const newLeadership = teamStructure.leadership.filter((_, i) => i !== index);
    setTeamStructure({ ...teamStructure, leadership: newLeadership });
    toast.success('Leader removed successfully');
  };

  const handleRemoveDepartment = (index: number) => {
    const newDepartments = teamStructure.departments.filter((_, i) => i !== index);
    setTeamStructure({ ...teamStructure, departments: newDepartments });
    toast.success('Department removed successfully');
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Company Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            {isEditing && (
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="gap-2 hover:bg-gray-100 transition-colors"
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </>
              )}
        </Button>
          </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Company Logo and Basic Info */}
          <div className="space-y-6">
            <Card className="overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="h-40 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
              </div>
              <CardContent className="pt-0">
                <div className="flex flex-col items-center -mt-20">
                  <div className="relative group">
                    <div className="h-40 w-40 rounded-full bg-white p-1 shadow-lg ring-4 ring-white">
                      <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
                        {companyLogo ? (
                          <img 
                            src={companyLogo} 
                            alt="Company Logo" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Building2 className="h-20 w-20 text-blue-600" />
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <div 
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer backdrop-blur-sm"
                        onClick={triggerFileInput}
                      >
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <div className="text-center mt-4">
                    <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{companyInfo.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{companyInfo.type}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                        {companyInfo.size}
                      </Badge>
                    </div>
              </div>
            </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <Mail className="h-4 w-4 text-blue-500" />
                    {companyInfo.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <Phone className="h-4 w-4 text-blue-500" />
                    {companyInfo.phone}
              </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    {companyInfo.location}
              </div>
            </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex justify-center gap-4">
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">LinkedIn Profile</Label>
                          <Input
                            value={companyInfo.socialLinks.linkedin}
                            onChange={(e) => setCompanyInfo({
                              ...companyInfo,
                              socialLinks: { ...companyInfo.socialLinks, linkedin: e.target.value }
                            })}
                            placeholder="Enter LinkedIn profile URL"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Twitter Profile</Label>
                          <Input
                            value={companyInfo.socialLinks.twitter}
                            onChange={(e) => setCompanyInfo({
                              ...companyInfo,
                              socialLinks: { ...companyInfo.socialLinks, twitter: e.target.value }
                            })}
                            placeholder="Enter Twitter profile URL"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        </div>
              </div>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                          <Linkedin className="h-5 w-5 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                          <Twitter className="h-5 w-5 text-blue-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                          <Facebook className="h-5 w-5 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                          <Instagram className="h-5 w-5 text-pink-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                          <Github className="h-5 w-5 text-gray-900" />
                        </Button>
                      </>
                    )}
              </div>
            </div>
          </CardContent>
        </Card>

            {/* Company Stats */}
            
      </div>

          {/* Right Column - Company Details */}
          <div className="lg:col-span-2 space-y-6">
      {/* Company Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-none shadow-lg bg-gradient-to-br from-white/90 to-indigo-50/50 backdrop-blur-sm">
        <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Company Overview</CardTitle>
                     
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-indigo-500" />
                        Company Name
                      </Label>
                <Input 
                  value={companyInfo.name} 
                        readOnly={!isEditing}
                  onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                        className="bg-white/70 backdrop-blur-sm border-indigo-100 focus:border-indigo-300 transition-colors shadow-sm"
                      />
                    </motion.div>
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        Founded
                      </Label>
                <Input 
                  value={companyInfo.founded} 
                        readOnly={!isEditing}
                  onChange={(e) => setCompanyInfo({...companyInfo, founded: e.target.value})}
                        className="bg-white/70 backdrop-blur-sm border-indigo-100 focus:border-indigo-300 transition-colors shadow-sm"
                      />
                    </motion.div>
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-indigo-500" />
                        Company Type
                      </Label>
                <Input 
                  value={companyInfo.type} 
                        readOnly={!isEditing}
                  onChange={(e) => setCompanyInfo({...companyInfo, type: e.target.value})}
                        className="bg-white/70 backdrop-blur-sm border-indigo-100 focus:border-indigo-300 transition-colors shadow-sm"
                      />
                    </motion.div>
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Users className="h-4 w-4 text-indigo-500" />
                        Company Size
                      </Label>
                <Input 
                  value={companyInfo.size} 
                        readOnly={!isEditing}
                  onChange={(e) => setCompanyInfo({...companyInfo, size: e.target.value})}
                        className="bg-white/70 backdrop-blur-sm border-indigo-100 focus:border-indigo-300 transition-colors shadow-sm"
                />
                    </motion.div>
              </div>
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      Description
                    </Label>
                <Textarea 
                  value={companyInfo.description} 
                      readOnly={!isEditing}
                  onChange={(e) => setCompanyInfo({...companyInfo, description: e.target.value})}
                      className="h-32 bg-white/70 backdrop-blur-sm border-indigo-100 focus:border-indigo-300 transition-colors shadow-sm"
                />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="grid gap-4 md:grid-cols-2"
                  >
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-indigo-500" />
                        Email
                      </Label>
                      <Input 
                        value={companyInfo.email} 
                        readOnly={!isEditing}
                        onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                        className="bg-white/70 backdrop-blur-sm border-indigo-100 focus:border-indigo-300 transition-colors shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-indigo-500" />
                        Phone
                      </Label>
                      <Input 
                        value={companyInfo.phone} 
                        readOnly={!isEditing}
                        onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                        className="bg-white/70 backdrop-blur-sm border-indigo-100 focus:border-indigo-300 transition-colors shadow-sm"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className="space-y-2"
                  >
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-indigo-500" />
                      Address
                    </Label>
                    <Input 
                      value={companyInfo.address} 
                      readOnly={!isEditing}
                      onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                      className="bg-white/70 backdrop-blur-sm border-indigo-100 focus:border-indigo-300 transition-colors shadow-sm"
                    />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

      {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-none shadow-lg bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-sm">
        <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                      <Code2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Our Services</CardTitle>
                      </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid gap-6 md:grid-cols-2">
            {services.map((service, index) => (
                      <motion.div
                        key={service.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="border-none bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                      {service.icon}
                    </div>
                    <CardTitle className="text-base">
                                  {isEditing ? (
                        <Input 
                          value={service.title}
                          onChange={(e) => {
                            const newServices = [...services];
                            newServices[index].title = e.target.value;
                            setServices(newServices);
                          }}
                                      className="bg-white/70 backdrop-blur-sm border-blue-100 focus:border-blue-300 transition-colors shadow-sm"
                        />
                      ) : (
                        service.title
                      )}
                    </CardTitle>
                              </div>
                              {isEditing && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveService(index)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                  </div>
                </CardHeader>
                <CardContent>
                            {isEditing ? (
                    <Textarea 
                      value={service.description}
                      onChange={(e) => {
                        const newServices = [...services];
                        newServices[index].description = e.target.value;
                        setServices(newServices);
                      }}
                                className="bg-white/70 backdrop-blur-sm border-blue-100 focus:border-blue-300 transition-colors shadow-sm"
                    />
                  ) : (
                              <p className="text-sm text-gray-600">
                      {service.description}
                    </p>
                  )}
                </CardContent>
              </Card>
                      </motion.div>
            ))}
          </div>

                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 border-2 border-dashed border-blue-200 rounded-xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50 backdrop-blur-sm"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <Plus className="h-5 w-5 text-blue-500" />
                        Add New Service
                      </h3>
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Code2 className="h-4 w-4 text-blue-500" />
                              Service Title
                            </Label>
                            <Input
                              value={newService.title}
                              onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                              placeholder="Enter service title"
                              className="bg-white/70 backdrop-blur-sm border-blue-100 focus:border-blue-300 transition-colors shadow-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-500" />
                              Description
                            </Label>
                            <Textarea
                              value={newService.description}
                              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                              placeholder="Enter service description"
                              className="bg-white/70 backdrop-blur-sm border-blue-100 focus:border-blue-300 transition-colors shadow-sm"
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={handleAddService} 
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white transition-all duration-300"
                        >
                          Add Service
                        </Button>
                      </div>
                    </motion.div>
                  )}
        </CardContent>
      </Card>
            </motion.div>

      {/* Team Structure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-none shadow-lg bg-gradient-to-br from-white/90 to-green-50/50 backdrop-blur-sm">
        <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Team Structure</CardTitle>
                      </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-green-500" />
                        Leadership Team
                      </h3>
                      <div className="space-y-4">
                        {teamStructure.leadership.map((member, index) => (
                          <motion.div
                            key={member.role}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="group relative flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-green-100"
                          >
                            <div className="flex-1">
                              {isEditing ? (
                                <div className="space-y-3">
                                  <Input 
                                    value={member.role}
                                    onChange={(e) => {
                                      const newTeam = {...teamStructure};
                                      newTeam.leadership[index].role = e.target.value;
                                      setTeamStructure(newTeam);
                                    }}
                                    className="bg-white/70 backdrop-blur-sm border-green-100 focus:border-green-300 transition-colors shadow-sm"
                                    placeholder="Enter role"
                                  />
                                  <Input 
                                    value={member.name}
                                    onChange={(e) => {
                                      const newTeam = {...teamStructure};
                                      newTeam.leadership[index].name = e.target.value;
                                      setTeamStructure(newTeam);
                                    }}
                                    className="bg-white/70 backdrop-blur-sm border-green-100 focus:border-green-300 transition-colors shadow-sm"
                                    placeholder="Enter name"
                                  />
                                  <Input 
                                    value={member.experience}
                                    onChange={(e) => {
                                      const newTeam = {...teamStructure};
                                      newTeam.leadership[index].experience = e.target.value;
                                      setTeamStructure(newTeam);
                                    }}
                                    className="bg-white/70 backdrop-blur-sm border-green-100 focus:border-green-300 transition-colors shadow-sm"
                                    placeholder="Enter experience"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                                      <User className="h-5 w-5 text-green-600" />
                                    </div>
                                    <p className="font-semibold text-gray-800">{member.role}</p>
                                  </div>
                                  <p className="text-sm text-gray-600 ml-10">{member.name}</p>
                                  <div className="ml-10">
                                    <Badge variant="secondary" className="bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                                      {member.experience}
                                    </Badge>
                                  </div>
                                </div>
                              )}
                            </div>
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveLeader(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </motion.div>
                        ))}
                      </div>

                      {isEditing && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-6 border-2 border-dashed border-green-200 rounded-xl bg-gradient-to-br from-green-50/50 to-emerald-50/50 backdrop-blur-sm"
                        >
                          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-green-500" />
                            Add New Leader
                          </h3>
                          <div className="space-y-4">
                            <div className="grid gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                  <UserCog className="h-4 w-4 text-green-500" />
                                  Role
                                </Label>
                                <Input
                                  value={newLeader.role}
                                  onChange={(e) => setNewLeader({ ...newLeader, role: e.target.value })}
                                  placeholder="Enter role"
                                  className="bg-white/70 backdrop-blur-sm border-green-100 focus:border-green-300 transition-colors shadow-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                  <User className="h-4 w-4 text-green-500" />
                                  Name
                                </Label>
                                <Input
                                  value={newLeader.name}
                                  onChange={(e) => setNewLeader({ ...newLeader, name: e.target.value })}
                                  placeholder="Enter name"
                                  className="bg-white/70 backdrop-blur-sm border-green-100 focus:border-green-300 transition-colors shadow-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-green-500" />
                                  Experience
                                </Label>
                                <Input
                                  value={newLeader.experience}
                                  onChange={(e) => setNewLeader({ ...newLeader, experience: e.target.value })}
                                  placeholder="Enter experience"
                                  className="bg-white/70 backdrop-blur-sm border-green-100 focus:border-green-300 transition-colors shadow-sm"
                                />
                              </div>
                            </div>
                            <Button 
                              onClick={handleAddLeader} 
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transition-all duration-300"
                            >
                              Add Leader
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-green-500" />
                        Departments
                      </h3>
                      <div className="space-y-4">
                        {teamStructure.departments.map((dept, index) => (
                          <motion.div
                            key={dept.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="group relative flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-green-100"
                          >
                            <div className="flex-1">
                              {isEditing ? (
                                <div className="space-y-3">
                                  <Input 
                                    value={dept.name}
                                    onChange={(e) => {
                                      const newTeam = {...teamStructure};
                                      newTeam.departments[index].name = e.target.value;
                                      setTeamStructure(newTeam);
                                    }}
                                    className="bg-white/70 backdrop-blur-sm border-green-100 focus:border-green-300 transition-colors shadow-sm"
                                    placeholder="Enter department name"
                                  />
                                  <Input 
                                    value={dept.size}
                                    onChange={(e) => {
                                      const newTeam = {...teamStructure};
                                      newTeam.departments[index].size = e.target.value;
                                      setTeamStructure(newTeam);
                                    }}
                                    className="bg-white/70 backdrop-blur-sm border-green-100 focus:border-green-300 transition-colors shadow-sm"
                                    placeholder="Enter number of members"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                                      <Building2 className="h-5 w-5 text-green-600" />
                                    </div>
                                    <p className="font-semibold text-gray-800">{dept.name}</p>
                                  </div>
                                  <div className="ml-10">
                                    <Badge variant="secondary" className="bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                                      {dept.size} members
                                    </Badge>
                                  </div>
                                </div>
                              )}
                            </div>
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveDepartment(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </motion.div>
                        ))}
                      </div>

                      {isEditing && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-6 border-2 border-dashed border-green-200 rounded-xl bg-gradient-to-br from-green-50/50 to-emerald-50/50 backdrop-blur-sm"
                        >
                          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-green-500" />
                            Add New Department
                          </h3>
                          <div className="space-y-4">
                            <div className="grid gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-green-500" />
                                  Department Name
                                </Label>
                                <Input
                                  value={newDepartment.name}
                                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                                  placeholder="Enter department name"
                                  className="bg-white/70 backdrop-blur-sm border-green-100 focus:border-green-300 transition-colors shadow-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                  <Users className="h-4 w-4 text-green-500" />
                                  Number of Members
                                </Label>
                                <Input
                                  value={newDepartment.size}
                                  onChange={(e) => setNewDepartment({ ...newDepartment, size: e.target.value })}
                                  placeholder="Enter number of members"
                                  className="bg-white/70 backdrop-blur-sm border-green-100 focus:border-green-300 transition-colors shadow-sm"
                                />
                              </div>
                            </div>
                            <Button 
                              onClick={handleAddDepartment} 
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transition-all duration-300"
                            >
                              Add Department
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

      {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-none shadow-lg bg-gradient-to-br from-white/90 to-amber-50/50 backdrop-blur-sm">
        <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Achievements & Recognition</CardTitle>
                     </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-amber-100"
                      >
                        <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                          <Award className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                          {isEditing ? (
                            <div className="space-y-3">
                      <Input 
                        value={achievement.title}
                        onChange={(e) => {
                          const newAchievements = [...achievements];
                          newAchievements[index].title = e.target.value;
                          setAchievements(newAchievements);
                        }}
                                className="bg-white/70 backdrop-blur-sm border-amber-100 focus:border-amber-300 transition-colors shadow-sm"
                                placeholder="Enter achievement title"
                      />
                      <Input 
                        value={achievement.organization}
                        onChange={(e) => {
                          const newAchievements = [...achievements];
                          newAchievements[index].organization = e.target.value;
                          setAchievements(newAchievements);
                        }}
                                className="bg-white/70 backdrop-blur-sm border-amber-100 focus:border-amber-300 transition-colors shadow-sm"
                                placeholder="Enter organization name"
                              />
                              <div className="flex items-center justify-between">
                                <Input 
                                  value={achievement.year}
                                  onChange={(e) => {
                                    const newAchievements = [...achievements];
                                    newAchievements[index].year = e.target.value;
                                    setAchievements(newAchievements);
                                  }}
                                  className="w-24 bg-white/70 backdrop-blur-sm border-amber-100 focus:border-amber-300 transition-colors shadow-sm"
                                  placeholder="Year"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveAchievement(index)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                  ) : (
                    <>
                              <p className="font-medium text-gray-800">{achievement.title}</p>
                              <p className="text-sm text-gray-600">{achievement.organization}</p>
                              <Badge variant="secondary" className="mt-2 bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors">
                                {achievement.year}
                              </Badge>
                    </>
                  )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 border-2 border-dashed border-amber-200 rounded-xl bg-gradient-to-br from-amber-50/50 to-orange-50/50 backdrop-blur-sm"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <Plus className="h-5 w-5 text-amber-500" />
                        Add New Achievement
                      </h3>
                      <div className="space-y-4">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Award className="h-4 w-4 text-amber-500" />
                              Title
                            </Label>
                            <Input
                              value={newAchievement.title}
                              onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                              placeholder="Enter achievement title"
                              className="bg-white/70 backdrop-blur-sm border-amber-100 focus:border-amber-300 transition-colors shadow-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-amber-500" />
                              Organization
                            </Label>
                            <Input
                              value={newAchievement.organization}
                              onChange={(e) => setNewAchievement({ ...newAchievement, organization: e.target.value })}
                              placeholder="Enter organization name"
                              className="bg-white/70 backdrop-blur-sm border-amber-100 focus:border-amber-300 transition-colors shadow-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-amber-500" />
                              Year
                            </Label>
                            <Input
                              value={newAchievement.year}
                              onChange={(e) => setNewAchievement({ ...newAchievement, year: e.target.value })}
                              placeholder="Enter year"
                              className="bg-white/70 backdrop-blur-sm border-amber-100 focus:border-amber-300 transition-colors shadow-sm"
                            />
                </div>
              </div>
                        <Button 
                          onClick={handleAddAchievement} 
                          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white transition-all duration-300"
                        >
                          Add Achievement
                        </Button>
          </div>
                    </motion.div>
                  )}
        </CardContent>
      </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 