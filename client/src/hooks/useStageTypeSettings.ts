import { useQuery } from "@tanstack/react-query";
import { getToken } from "@/lib/auth";

interface StageTypeSetting {
  id: string;
  stageType: string;
  displayName: string;
  icon: string;
  isActive: number;
  sortOrder: number;
}

export function useStageTypeSettings() {
  const token = getToken();
  
  return useQuery<StageTypeSetting[]>({
    queryKey: ["/api/admin/stage-types"],
    queryFn: async () => {
      if (!token) throw new Error("Not authenticated");
      const response = await fetch("/api/admin/stage-types", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch stage types");
      return response.json();
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
}

export function createStageTypeMap(settings: StageTypeSetting[]): Map<string, { displayName: string; icon: string; sortOrder: number }> {
  const map = new Map();
  settings.forEach(setting => {
    map.set(setting.stageType, {
      displayName: setting.displayName,
      icon: setting.icon,
      sortOrder: setting.sortOrder
    });
  });
  return map;
}
