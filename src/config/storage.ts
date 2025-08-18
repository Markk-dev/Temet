
export const STORAGE_CONFIG = {
  
  FREE: {
    limit: 1 * 1024 * 1024 * 1024, 
    name: "Free Tier"
  },
  
  PRO: {
    limit: 10 * 1024 * 1024 * 1024, 
    name: "Pro Tier"
  },
  
  ENTERPRISE: {
    limit: 100 * 1024 * 1024 * 1024, 
    name: "Enterprise Tier"
  }
};


export const CURRENT_PLAN = "FREE";


export const getCurrentStorageLimit = () => {
  return STORAGE_CONFIG[CURRENT_PLAN as keyof typeof STORAGE_CONFIG].limit;
};


export const getCurrentPlanName = () => {
  return STORAGE_CONFIG[CURRENT_PLAN as keyof typeof STORAGE_CONFIG].name;
}; 