import { Link, useLocation, LinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps extends LinkProps {
  activeClassName?: string;
  end?: boolean;
}

export function NavLink({ 
  to, 
  className, 
  activeClassName, 
  end = false,
  children,
  ...props 
}: NavLinkProps) {
  const location = useLocation();
  const path = typeof to === 'string' ? to : to.pathname;
  
  const isActive = end 
    ? location.pathname === path 
    : location.pathname.startsWith(path || '');

  return (
    <Link
      to={to}
      className={cn(className, isActive && activeClassName)}
      {...props}
    >
      {children}
    </Link>
  );
}
