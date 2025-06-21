import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  User, Mail, Phone, MapPin, Briefcase, Building2, Edit2, Save, X, Camera, 
  Calendar, Github, Linkedin, Twitter, Globe,
  Instagram, Facebook, GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    role: user?.role || '',
    department: user?.department || '',
    bio: user?.bio || '',
    designation: 'Senior Software Engineer',
    joiningDate: '2023-01-15',
    employeeId: 'EMP-2023-001',
    reportingManager: 'John Doe',
    workExperience: '5 years',
    education: 'B.Tech in Computer Science',
    languages: ['English', 'Gujarati', 'Hindi'],
    interests: ['Coding', 'Reading', 'Travel'],
    certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
    socialLinks: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      website: 'https://example.com',
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com'
    }
  });

  // Mock data for skills
  const profileStats = {
    skills: [
      { name: 'React', level: 'Expert' },
      { name: 'TypeScript', level: 'Advanced' },
      { name: 'Node.js', level: 'Advanced' },
      { name: 'UI/UX Design', level: 'Intermediate' },
      { name: 'Project Management', level: 'Expert' },
      { name: 'AWS', level: 'Intermediate' },
      { name: 'Docker', level: 'Advanced' },
      { name: 'GraphQL', level: 'Intermediate' }
    ]
  };

  const [skills, setSkills] = useState(profileStats.skills);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Intermediate' });

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      setSkills([...skills, newSkill]);
      setNewSkill({ name: '', level: 'Intermediate' });
      toast.success('Skill added successfully');
    }
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
    toast.success('Skill removed successfully');
  };

  const handleUpdateSkillLevel = (index: number, level: string) => {
    const updatedSkills = skills.map((skill, i) => 
      i === index ? { ...skill, level } : skill
    );
    setSkills(updatedSkills);
    toast.success('Skill level updated successfully');
  };

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
        setProfileImage(reader.result as string);
        toast.success('Profile photo updated successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    toast.success('Profile updated successfully');
    setIsEditing(false);
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
            <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
          </div>
          <div className="flex items-center gap-2">
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
          {/* Left Column - Profile Picture and Basic Info */}
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
                        {profileImage ? (
                          <img 
                            src={profileImage} 
                            alt="Profile" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-20 w-20 text-blue-600" />
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
                    <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{profileData.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{profileData.role}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                        {profileData.department}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <Mail className="h-4 w-4 text-blue-500" />
                    {profileData.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <Phone className="h-4 w-4 text-blue-500" />
                    {profileData.phone || 'Not provided'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    {profileData.location || 'Not provided'}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex justify-center gap-4">
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">GitHub Profile</Label>
                          <Input
                            value={profileData.socialLinks.github}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              socialLinks: { ...profileData.socialLinks, github: e.target.value }
                            })}
                            placeholder="Enter GitHub profile URL"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">LinkedIn Profile</Label>
                          <Input
                            value={profileData.socialLinks.linkedin}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              socialLinks: { ...profileData.socialLinks, linkedin: e.target.value }
                            })}
                            placeholder="Enter LinkedIn profile URL"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Twitter Profile</Label>
                          <Input
                            value={profileData.socialLinks.twitter}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              socialLinks: { ...profileData.socialLinks, twitter: e.target.value }
                            })}
                            placeholder="Enter Twitter profile URL"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Website</Label>
                          <Input
                            value={profileData.socialLinks.website}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              socialLinks: { ...profileData.socialLinks, website: e.target.value }
                            })}
                            placeholder="Enter website URL"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Instagram Profile</Label>
                          <Input
                            value={profileData.socialLinks.instagram}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              socialLinks: { ...profileData.socialLinks, instagram: e.target.value }
                            })}
                            placeholder="Enter Instagram profile URL"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Facebook Profile</Label>
                          <Input
                            value={profileData.socialLinks.facebook}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              socialLinks: { ...profileData.socialLinks, facebook: e.target.value }
                            })}
                            placeholder="Enter Facebook profile URL"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-4">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full hover:bg-gray-100 transition-colors"
                          onClick={() => window.open(profileData.socialLinks.github, '_blank')}
                        >
                          <Github className="h-5 w-5 text-gray-700" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full hover:bg-gray-100 transition-colors"
                          onClick={() => window.open(profileData.socialLinks.linkedin, '_blank')}
                        >
                          <Linkedin className="h-5 w-5 text-gray-700" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full hover:bg-gray-100 transition-colors"
                          onClick={() => window.open(profileData.socialLinks.twitter, '_blank')}
                        >
                          <Twitter className="h-5 w-5 text-gray-700" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full hover:bg-gray-100 transition-colors"
                          onClick={() => window.open(profileData.socialLinks.website, '_blank')}
                        >
                          <Globe className="h-5 w-5 text-gray-700" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full hover:bg-gray-100 transition-colors"
                          onClick={() => window.open(profileData.socialLinks.instagram, '_blank')}
                        >
                          <Instagram className="h-5 w-5 text-gray-700" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full hover:bg-gray-100 transition-colors"
                          onClick={() => window.open(profileData.socialLinks.facebook, '_blank')}
                        >
                          <Facebook className="h-5 w-5 text-gray-700" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-lg font-semibold text-gray-800">Skills</CardTitle>
                </CardHeader>
              <CardContent className="pt-6">
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-3">
                      {skills.map((skill, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group relative"
                        >
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-700 text-lg">{skill.name}</span>
                              {isEditing ? (
                                <Select
                                  value={skill.level}
                                  onValueChange={(value) => handleUpdateSkillLevel(index, value)}
                                >
                                  <SelectTrigger className="w-[140px] h-8 text-sm bg-white/50 backdrop-blur-sm">
                                    <SelectValue placeholder="Select level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Beginner" className="text-sm text-gray-700">Beginner</SelectItem>
                                    <SelectItem value="Intermediate" className="text-sm text-gray-700">Intermediate</SelectItem>
                                    <SelectItem value="Advanced" className="text-sm text-gray-700">Advanced</SelectItem>
                                    <SelectItem value="Expert" className="text-sm text-gray-700">Expert</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge 
                                  variant="secondary" 
                                  className={`${
                                    skill.level === 'Expert' ? 'bg-purple-50 text-purple-700' :
                                    skill.level === 'Advanced' ? 'bg-blue-50 text-blue-700' :
                                    skill.level === 'Intermediate' ? 'bg-green-50 text-green-700' :
                                    'bg-gray-50 text-gray-700'
                                  } transition-colors px-3 py-1`}
                                >
                                  {skill.level}
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-3 right-3 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveSkill(index)}
                            >
                              <X className="h-4 w-4 text-gray-500 hover:text-red-500 transition-colors" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="bg-gray-50/50 rounded-lg p-4 space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Add New Skill</h4>
                      <div className="flex flex-col gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-gray-700">Skill Name</Label>
                          <Input
                            value={newSkill.name}
                            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                            placeholder="Enter skill name"
                            className="h-9 text-sm bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-gray-700">Skill Level</Label>
                          <Select
                            value={newSkill.level}
                            onValueChange={(value) => setNewSkill({ ...newSkill, level: value })}
                          >
                            <SelectTrigger className="h-9 text-sm bg-white/50 backdrop-blur-sm">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner" className="text-sm text-gray-700">Beginner</SelectItem>
                              <SelectItem value="Intermediate" className="text-sm text-gray-700">Intermediate</SelectItem>
                              <SelectItem value="Advanced" className="text-sm text-gray-700">Advanced</SelectItem>
                              <SelectItem value="Expert" className="text-sm text-gray-700">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          onClick={handleAddSkill} 
                          className="h-9 text-sm bg-gray-900 hover:bg-gray-800 transition-colors"
                        >
                          Add Skill
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-3">
                      {skills.map((skill, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group"
                        >
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-medium text-gray-700 text-lg">{skill.name}</span>
                              <Badge 
                                variant="secondary" 
                                className={`${
                                  skill.level === 'Expert' ? 'bg-purple-50 text-purple-700' :
                                  skill.level === 'Advanced' ? 'bg-blue-50 text-blue-700' :
                                  skill.level === 'Intermediate' ? 'bg-green-50 text-green-700' :
                                  'bg-gray-50 text-gray-700'
                                } transition-colors px-3 py-1`}
                              >
                                {skill.level}
                              </Badge>
                            </div>
                            <div className="mt-2">
                              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    skill.level === 'Expert' ? 'bg-purple-500 w-full' :
                                    skill.level === 'Advanced' ? 'bg-blue-500 w-3/4' :
                                    skill.level === 'Intermediate' ? 'bg-green-500 w-1/2' :
                                    'bg-gray-500 w-1/4'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-xl font-semibold text-gray-800">Profile Information</CardTitle>
                 </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-8">
                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                        {isEditing ? (
                          <Input
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            placeholder="Enter your full name"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-md hover:bg-gray-100/80 transition-colors">
                            <User className="h-4 w-4 text-blue-500" />
                            {profileData.name}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        {isEditing ? (
                          <Input
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            placeholder="Enter your email"
                            type="email"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-md hover:bg-gray-100/80 transition-colors">
                            <Mail className="h-4 w-4 text-blue-500" />
                            {profileData.email}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Phone</Label>
                        {isEditing ? (
                          <Input
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            placeholder="Enter your phone number"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-md hover:bg-gray-100/80 transition-colors">
                            <Phone className="h-4 w-4 text-blue-500" />
                            {profileData.phone || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Location</Label>
                        {isEditing ? (
                          <Input
                            value={profileData.location}
                            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                            placeholder="Enter your location"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-md hover:bg-gray-100/80 transition-colors">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            {profileData.location || 'Not provided'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gray-200/50" />

                  {/* Professional Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Role</Label>
                        {isEditing ? (
                          <Input
                            value={profileData.role}
                            onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                            placeholder="Enter your role"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-md hover:bg-gray-100/80 transition-colors">
                            <Briefcase className="h-4 w-4 text-blue-500" />
                            {profileData.role}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Department</Label>
                        {isEditing ? (
                          <Input
                            value={profileData.department}
                            onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                            placeholder="Enter your department"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-md hover:bg-gray-100/80 transition-colors">
                            <Building2 className="h-4 w-4 text-blue-500" />
                            {profileData.department || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Designation</Label>
                        {isEditing ? (
                          <Input
                            value={profileData.designation}
                            onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                            placeholder="Enter your designation"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-md hover:bg-gray-100/80 transition-colors">
                            <Briefcase className="h-4 w-4 text-blue-500" />
                            {profileData.designation}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Employee ID</Label>
                        {isEditing ? (
                          <Input
                            value={profileData.employeeId}
                            onChange={(e) => setProfileData({ ...profileData, employeeId: e.target.value })}
                            placeholder="Enter your employee ID"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-md hover:bg-gray-100/80 transition-colors">
                            <User className="h-4 w-4 text-blue-500" />
                            {profileData.employeeId}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Joining Date</Label>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={profileData.joiningDate}
                            onChange={(e) => setProfileData({ ...profileData, joiningDate: e.target.value })}
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-md hover:bg-gray-100/80 transition-colors">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            {profileData.joiningDate}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Reporting Manager</Label>
                        {isEditing ? (
                          <Input
                            value={profileData.reportingManager}
                            onChange={(e) => setProfileData({ ...profileData, reportingManager: e.target.value })}
                            placeholder="Enter reporting manager name"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-md hover:bg-gray-100/80 transition-colors">
                            <User className="h-4 w-4 text-blue-500" />
                            {profileData.reportingManager}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gray-200/50" />

                  {/* Education & Experience Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Education & Experience</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Work Experience</Label>
                        {isEditing ? (
                          <Input
                            value={profileData.workExperience}
                            onChange={(e) => setProfileData({ ...profileData, workExperience: e.target.value })}
                            placeholder="Enter work experience"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-md hover:bg-gray-100/80 transition-colors">
                            <Briefcase className="h-4 w-4 text-blue-500" />
                            {profileData.workExperience}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Education</Label>
                        {isEditing ? (
                          <Input
                            value={profileData.education}
                            onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                            placeholder="Enter education details"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-md hover:bg-gray-100/80 transition-colors">
                            <GraduationCap className="h-4 w-4 text-blue-500" />
                            {profileData.education}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gray-200/50" />

                  {/* Additional Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Languages</Label>
                        {isEditing ? (
                          <Input
                            value={profileData.languages.join(', ')}
                            onChange={(e) => setProfileData({ ...profileData, languages: e.target.value.split(', ') })}
                            placeholder="Enter languages (comma separated)"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-md">
                            {profileData.languages.map((lang, index) => (
                              <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Interests</Label>
                        {isEditing ? (
                          <Input
                            value={profileData.interests.join(', ')}
                            onChange={(e) => setProfileData({ ...profileData, interests: e.target.value.split(', ') })}
                            placeholder="Enter interests (comma separated)"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-md">
                            {profileData.interests.map((interest, index) => (
                              <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Certifications</Label>
                        {isEditing ? (
                          <Input
                            value={profileData.certifications.join(', ')}
                            onChange={(e) => setProfileData({ ...profileData, certifications: e.target.value.split(', ') })}
                            placeholder="Enter certifications (comma separated)"
                            className="bg-white/50 backdrop-blur-sm"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-md">
                            {profileData.certifications.map((cert, index) => (
                              <Badge key={index} variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gray-200/50" />

                  {/* Bio Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">About</h3>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Bio</Label>
                      {isEditing ? (
                        <Textarea
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          placeholder="Tell us about yourself"
                          rows={4}
                          className="bg-white/50 backdrop-blur-sm"
                        />
                      ) : (
                        <div className="text-sm text-gray-600 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-md">
                          {profileData.bio || 'No bio provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200/50">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="gap-2 bg-gray-900 hover:bg-gray-800 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 