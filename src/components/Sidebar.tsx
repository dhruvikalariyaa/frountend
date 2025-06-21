import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  UserPlus,
  Wallet,
  Package,
  ChevronLeft,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  permission?: string;
  subItems?: {
    title: string;
    href: string;
    permission?: string;
  }[];
}

export default function Sidebar() {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
      permission: "VIEW_DASHBOARD",
    },
    {
      title: "Employee Management",
      icon: <Users className="h-5 w-5" />,
      href: "/employees",
      permission: "VIEW_EMPLOYEES",
      subItems: [
        {
          title: "All Employees",
          href: "/employees",
          permission: "VIEW_EMPLOYEES",
        },

        {
          title: "Departments",
          href: "/employees/departments",
          permission: "VIEW_DEPARTMENTS",
        },
        {
          title: "Attendance",
          href: "/employees/attendance",
          permission: "VIEW_ATTENDANCE",
        },
        {
          title: "Performance",
          href: "/employees/performance",
          permission: "VIEW_PERFORMANCE",
        },
        {
          title: "Leave Management",
          href: "/employees/leaves",
          permission: "VIEW_LEAVE",
        },
      ],
    },
    {
      title: "Hiring",
      icon: <UserPlus className="h-5 w-5" />,
      href: "/hiring",
      permission: "VIEW_JOBS",
      subItems: [
        {
          title: "Job Postings",
          href: "/hiring/jobs",
          permission: "VIEW_JOBS",
        },
        {
          title: "Candidates",
          href: "/hiring/candidates",
          permission: "VIEW_CANDIDATES",
        },
        {
          title: "Interviews",
          href: "/hiring/interviews",
          permission: "VIEW_INTERVIEWS",
        },
        {
          title: "Onboarding",
          href: "/hiring/onboarding",
          permission: "VIEW_ONBOARDING",
        },
      ],
    },
    {
      title: "Projects",
      icon: <Briefcase className="h-5 w-5" />,
      href: "/projects",
      permission: "VIEW_PROJECTS",
      subItems: [
        {
          title: "All Projects",
          href: "/projects",
          permission: "VIEW_PROJECTS",
        },
        {
          title: "Tasks",
          href: "/projects/tasks",
          permission: "VIEW_PROJECT_DETAILS",
        },
        {
          title: "Sprints",
          href: "/projects/sprints",
          permission: "VIEW_SPRINT_DETAILS",
        },
        {
          title: "Timeline",
          href: "/projects/timeline",
          permission: "VIEW_TIMELINE",
        },
        {
          title: "Resources",
          href: "/projects/resources",
          permission: "VIEW_RESOURCES",
        },
        {
          title: "Deliverables",
          href: "/projects/deliverables",
          permission: "VIEW_DELIVERABLES",
        },
      ],
    },
    {
      title: "Sales & Clients",
      icon: <Building2 className="h-5 w-5" />,
      href: "/sales",
      permission: "VIEW_CLIENTS",
      subItems: [
        {
          title: "Clients",
          href: "/sales/clients",
          permission: "VIEW_CLIENTS",
        },
        {
          title: "Proposals",
          href: "/sales/proposals",
          permission: "VIEW_PROPOSALS",
        },
        {
          title: "Contracts",
          href: "/sales/contracts",
          permission: "VIEW_CONTRACTS",
        },
        {
          title: "Revenue",
          href: "/sales/revenue",
          permission: "VIEW_REVENUE_DETAILS",
        },
      ],
    },
    {
      title: "Assets",
      icon: <Package className="h-5 w-5" />,
      href: "/assets",
      permission: "VIEW_ASSETS",
      subItems: [
        {
          title: "All Assets",
          href: "/assets",
          permission: "VIEW_ASSETS",
        },
        {
          title: "Licenses",
          href: "/assets/licenses",
          permission: "VIEW_LICENSES",
        },
        {
          title: "Maintenance",
          href: "/assets/maintenance",
          permission: "VIEW_MAINTENANCE",
        },
      ],
    },
    {
      title: "Finance",
      icon: <Wallet className="h-5 w-5" />,
      href: "/finance",
      permission: "VIEW_INVOICES",
      subItems: [
        {
          title: "Invoices",
          href: "/finance/invoices",
          permission: "VIEW_INVOICES",
        },
        {
          title: "Expenses",
          href: "/finance/expenses",
          permission: "VIEW_EXPENSES",
        },
        {
          title: "Payroll",
          href: "/finance/payroll",
          permission: "VIEW_PAYROLL",
        },
        {
          title: "Reports",
          href: "/finance/reports",
          permission: "VIEW_REPORTS",
        },
      ],
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/settings",
      permission: "VIEW_SETTINGS",
      subItems: [
        {
          title: "Company Profile",
          href: "/settings/company",
          permission: "VIEW_COMPANY_PROFILE",
        },
        {
          title: "Roles & Permissions",
          href: "/settings/roles",
          permission: "MANAGE_ROLES",
        },
        {
          title: "System Settings",
          href: "/settings/system",
          permission: "VIEW_SYSTEM_SETTINGS",
        },
      ],
    },
  ];

  // Load recent from localStorage
  useEffect(() => {
    const savedRecent = localStorage.getItem("sidebarRecent");
    if (savedRecent) setRecentItems(JSON.parse(savedRecent));
  }, []);

  // Save recent to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarRecent", JSON.stringify(recentItems));
  }, [recentItems]);

  // Auto-expand items based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const expanded = menuItems
      .filter((item) => currentPath.startsWith(item.href))
      .map((item) => item.title);
    setExpandedItems(expanded);
  }, [location.pathname]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleItem = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const handleNavigation = (href: string, permission?: string) => {
    if (permission && !hasPermission(permission)) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
      return;
    }
    navigate(href);
  };

  // Filter and organize menu items
  const filteredMenuItems = menuItems
    .filter((item) => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.subItems?.some((subItem) =>
          subItem.title.toLowerCase().includes(searchLower)
        )
      );
    })
    .filter((item) => {
      if (!item.permission) return true;
      const hasMainPermission = hasPermission(item.permission);
      if (item.subItems) {
        const hasAccessibleSubItems = item.subItems.some(
          (subItem) => !subItem.permission || hasPermission(subItem.permission)
        );
        return hasMainPermission && hasAccessibleSubItems;
      }
      return hasMainPermission;
    });

  return (
    <div
      className={cn(
        "h-full bg-white border-r border-gray-200/80 flex flex-col transition-all duration-300",
        isCollapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      <div className="p-4 border-b border-gray-200/80">
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <Input
              ref={searchInputRef}
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-9 w-9"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {filteredMenuItems.map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-1"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start rounded-xl px-3 py-2 text-sm font-medium transition-all",
                        "hover:bg-blue-50/50 hover:text-blue-600 hover:shadow-sm",
                        location.pathname.startsWith(item.href) &&
                          "bg-blue-50/80 text-blue-600 shadow-sm",
                        !item.subItems && "h-10"
                      )}
                      onClick={() => {
                        if (item.subItems) {
                          toggleItem(item.title);
                        } else {
                          handleNavigation(item.href, item.permission);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-sm">
                            {item.icon}
                          </div>
                          {!isCollapsed && <span>{item.title}</span>}
                        </div>
                        {!isCollapsed && item.subItems && (
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              expandedItems.includes(item.title)
                                ? "transform rotate-180"
                                : ""
                            )}
                          />
                        )}
                      </div>
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="bg-white">
                      {item.title}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              {!isCollapsed && item.subItems && (
                <AnimatePresence>
                  {expandedItems.includes(item.title) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 space-y-1">
                        {item.subItems.map((subItem) => (
                          <motion.div
                            key={subItem.title}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start rounded-xl px-3 py-2 text-sm font-medium transition-all",
                                "hover:bg-blue-50/50 hover:text-blue-600 hover:shadow-sm",
                                location.pathname === subItem.href &&
                                  "bg-blue-50/80 text-blue-600 shadow-sm"
                              )}
                              onClick={() =>
                                handleNavigation(
                                  subItem.href,
                                  subItem.permission
                                )
                              }
                            >
                              {subItem.title}
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Profile and Logout Section */}
      <div className="border-t border-gray-200/80 p-4">
        <div
          className={cn(
            "rounded-xl bg-gradient-to-r from-white/50 to-blue-50/30 p-3 shadow-sm",
            isCollapsed
              ? "flex flex-col items-center gap-2"
              : "flex items-center gap-3"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2",
              isCollapsed ? "flex-col" : "flex-1"
            )}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            {!isCollapsed && (
              <div>
                <div className="font-medium text-slate-900">{user?.name}</div>
                <div className="text-xs text-blue-600/70">{user?.role}</div>
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex items-center gap-2",
              isCollapsed ? "flex-col" : ""
            )}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/profile")}
                    className="h-8 w-8 rounded-lg hover:bg-blue-50/50 hover:text-blue-600"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-white">
                  <p>Profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="h-8 w-8 rounded-lg hover:bg-blue-50/50 hover:text-blue-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-white">
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
