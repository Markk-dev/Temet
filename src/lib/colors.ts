const generateColor = (index: number): string => {
  const hues = [210, 150, 45, 270, 330, 30, 180, 300, 60, 240, 15, 195, 120, 285, 75];
  const hue = hues[index % hues.length];
  const saturation = 65 + (index % 3) * 15; 
  const lightness = 45 + (index % 2) * 10;  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const MEMBER_COLORS = [
  '#3b82f6', 
  '#10b981', 
  '#f59e0b', 
  '#8b5cf6', 
  '#ec4899', 
  '#ef4444', 
  '#06b6d4', 
  '#84cc16', 
  '#f97316', 
  '#6366f1', 
  '#14b8a6', 
  '#eab308', 
  '#f43f5e', 
  '#8b5a2b', 
  '#64748b', 
  '#dc2626', 
  '#0891b2', 
  '#65a30d', 
  '#c2410c', 
  '#7c3aed', 
];


export const createMemberColorMap = <T extends { id: string }>(members: T[]): Map<string, string> => {
  const memberColorMap = new Map<string, string>();
  
  members.forEach((member, index) => {
    if (index < MEMBER_COLORS.length) {
      memberColorMap.set(member.id, MEMBER_COLORS[index]);
    } else {
      
      memberColorMap.set(member.id, generateColor(index));
    }
  });
  
  return memberColorMap;
};

export const getMemberColor = (memberId: string, memberIndex: number): string => {
  if (memberIndex < MEMBER_COLORS.length) {
    return MEMBER_COLORS[memberIndex];
  }
  return generateColor(memberIndex);
}; 