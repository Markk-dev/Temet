import { Skeleton } from "@/components/ui/skeleton";

const Loader = () => (
  <div className='flex h-screen w-screen flex-col items-center justify-center gap-4'>
    {/* Canvas loading skeleton */}
    <div className="flex flex-col items-center gap-4">
      {/* Main canvas area skeleton */}
      <Skeleton className="h-96 w-96 rounded-lg" />
      
      {/* Toolbar skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
    </div>
    
    {/* Loading text */}
    <div className="flex flex-col items-center gap-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className='text-sm font-medium text-muted-foreground'>Loading canvas...</p>
    </div>
  </div>
);

export default Loader;