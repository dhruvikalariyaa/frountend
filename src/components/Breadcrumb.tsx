import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  items?: Array<{
    label: string;
    href: string;
  }>;
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbItems = items || [
    { label: 'Home', href: '/' },
    ...pathnames.map((value, index) => {
      const href = `/${pathnames.slice(0, index + 1).join('/')}`;
      return {
        label: value.charAt(0).toUpperCase() + value.slice(1),
        href,
      };
    }),
  ];

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.href}>
          {index === 0 ? (
            <Link
              to={item.href}
              className="flex items-center hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link
                to={item.href}
                className={`hover:text-foreground transition-colors ${
                  index === breadcrumbItems.length - 1
                    ? 'text-foreground font-medium'
                    : ''
                }`}
              >
                {item.label}
              </Link>
            </>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
} 