import { MemberRole } from "@/features/members/types";

interface CheckTaskPermissionProps {
  currentUserId?: string;
  assignees?: any[];
  currentMemberRole?: MemberRole;
}

export const canEditTask = ({ 
  currentUserId, 
  assignees, 
  currentMemberRole 
}: CheckTaskPermissionProps): boolean => {
  // Admin can always edit
  if (currentMemberRole === MemberRole.ADMIN) {
    return true;
  }

  // Check if user is assignee
  if (!currentUserId || !assignees) {
    return false;
  }

  const assigneesArr = Array.isArray(assignees) ? assignees : assignees ? [assignees] : [];
  const isAssignee = assigneesArr.some(
    (a: any) => a.userId === currentUserId || a.$id === currentUserId
  );

  return isAssignee;
}; 