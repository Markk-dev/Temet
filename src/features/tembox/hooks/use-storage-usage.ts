import { useQuery } from "@tanstack/react-query";

interface StorageUsage {
  used: number;
  total: number;
  percentage: number;
  fileCount: number;
}

export const useStorageUsage = () => {
  return useQuery<StorageUsage>({
    queryKey: ["storage-usage"],
    queryFn: async () => {
      const response = await fetch("/api/storage/usage");
      
      if (!response.ok) {
        throw new Error("Failed to fetch storage usage");
      }
      
      return response.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}; 