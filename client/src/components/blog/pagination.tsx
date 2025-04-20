import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  
  // Generate an array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Adjust as needed
    
    // Always show first page
    pages.push(1);
    
    // Calculate start and end of the "window" of page numbers
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust window if we're at the beginning or end
    if (currentPage <= 3) {
      end = Math.min(totalPages - 1, maxPagesToShow - 1);
    } else if (currentPage >= totalPages - 2) {
      start = Math.max(2, totalPages - maxPagesToShow + 2);
    }
    
    // Add ellipsis if there's a gap after page 1
    if (start > 2) {
      pages.push('ellipsis1');
    }
    
    // Add the window of page numbers
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis if there's a gap before the last page
    if (end < totalPages - 1) {
      pages.push('ellipsis2');
    }
    
    // Always show last page if we have more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex justify-center mt-12">
      <nav className="inline-flex rounded-md shadow">
        <Button
          variant="outline"
          size="sm"
          className="rounded-l-md"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis1' || page === 'ellipsis2') {
            return (
              <Button
                key={`ellipsis-${index}`}
                variant="outline"
                size="sm"
                disabled
              >
                ...
              </Button>
            );
          }
          
          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className={currentPage === page ? "bg-primary text-white" : ""}
            >
              {page}
            </Button>
          );
        })}
        
        <Button
          variant="outline"
          size="sm"
          className="rounded-r-md"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </nav>
    </div>
  );
}
