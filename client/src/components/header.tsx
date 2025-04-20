import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PenSquare, Menu, X } from "lucide-react";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>DevInsight</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="font-medium text-gray-900 hover:text-primary transition">
              Home
            </Link>
            <Link href="/" className="font-medium text-gray-600 hover:text-primary transition">
              Articles
            </Link>
            <Link href="/" className="font-medium text-gray-600 hover:text-primary transition">
              Categories
            </Link>
            <Link href="/" className="font-medium text-gray-600 hover:text-primary transition">
              About
            </Link>
          </nav>
          
          {/* Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link href="/create">
                  <Button variant="outline" size="sm" className="gap-2">
                    <PenSquare className="h-4 w-4" />
                    <span>New Post</span>
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl || ""} alt={user.name || user.username} />
                        <AvatarFallback>
                          {(user.name || user.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/create">Create Post</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth?tab=register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-700 focus:outline-none" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col gap-4">
              <Link href="/" className="font-medium text-gray-900 hover:text-primary transition py-2 border-b border-gray-100">
                Home
              </Link>
              <Link href="/" className="font-medium text-gray-600 hover:text-primary transition py-2 border-b border-gray-100">
                Articles
              </Link>
              <Link href="/" className="font-medium text-gray-600 hover:text-primary transition py-2 border-b border-gray-100">
                Categories
              </Link>
              <Link href="/" className="font-medium text-gray-600 hover:text-primary transition py-2 border-b border-gray-100">
                About
              </Link>
            </nav>
            <div className="flex items-center gap-4 mt-4">
              {user ? (
                <div className="flex flex-col w-full gap-2">
                  <div className="flex items-center gap-2 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl || ""} alt={user.name || user.username} />
                      <AvatarFallback>
                        {(user.name || user.username).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name || user.username}</span>
                  </div>
                  <Link href="/create" className="w-full">
                    <Button variant="outline" className="w-full gap-2 justify-center">
                      <PenSquare className="h-4 w-4" />
                      <span>New Post</span>
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/auth" className="flex-1">
                    <Button variant="ghost" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/auth?tab=register" className="flex-1">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
