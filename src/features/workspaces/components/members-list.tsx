"use client"

import Link from "next/link";
import { Fragment } from "react";
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react";

import { MemberRole } from "@/features/members/types";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { MemberAvatar } from "@/features/members/components/members-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";
import { useCurrent } from "@/features/auth/api/use-current";

import { Button } from "@/components/ui/button";
import { UseConfirm } from "@/hooks/use-confirm";
import { Separator } from "@/components/ui/separator";
import { DottedSeparator } from "@/components/dotted-line";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const MembersList = () => {
    const workspaceId = useWorkspaceId();
    const { data } = useGetMembers({workspaceId});

    const [ConfirmDialog, confirm] = UseConfirm(
        "Remove member",
        "This member will be removed from the workspace",
        "deletion"
    );

    const {
        mutate: deleteMember,
        isPending: isDeletingMember,
    } = useDeleteMember();

    const {
        mutate: updateMember,
        isPending: isUpdatingMember,
    } = useUpdateMember();


    const handleUpdateMember = (memberId: string, role: MemberRole) => {
        updateMember({
            json: {role},
            param:{memberId},
        });
    }

    const handleDeleteMember = async (memberId: string) => {
        const ok = await confirm();
        if(!ok) return;

        deleteMember({ param: { memberId }}, {
            onSuccess: () => {
                window.location.reload();
            },
        }
    )}


    return (
        <Card className="w-full h-full border-none shadow-none">
            <ConfirmDialog/>
           <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
            <Button asChild variant={"secondary"} size={"sm"}>
                <Link href={`/workspaces/${workspaceId}`}>
                    <ArrowLeftIcon className="size-4 mr-2"/>
                    Back
                </Link>
            </Button>
            <CardTitle className="text-xl font-bold">
                Members List
            </CardTitle>
            </CardHeader>
                <div className="px-7 ">
                    <DottedSeparator/>
                </div>
                <CardContent className="p-7">
                    {data?.documents.map((member, index) => {
                        const m = member as typeof member & { role: string };
                        return (
                            <Fragment key={m.$id}>
                                <div className="flex items-center gap-2">
                                    <MemberAvatar
                                       className="size-10"
                                       fallbackClassName="text-lg"
                                       name={m.name}
                                    />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium">{m.name}</p>
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs font-semibold
                                                    ${m.role === "ADMIN" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                                            >
                                                {m.role === "ADMIN" ? "Admin" : "Member"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{m.email}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                className="ml-auto"
                                                variant="secondary"
                                                size="icon"
                                                >
                                                <MoreVerticalIcon className="size-4 text-muted-foreground"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="bottom" align="end">
                                            <DropdownMenuItem className="font-medium" onClick={() => handleUpdateMember(m.$id, MemberRole.ADMIN)} disabled={isUpdatingMember}>
                                                Set as Administrator
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="font-medium"onClick={() => handleUpdateMember(m.$id, MemberRole.MEMBER)} disabled={isUpdatingMember}>
                                                Set as Member
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="font-medium text-red-700" onClick={() => handleDeleteMember(m.$id)} disabled={isDeletingMember}>
                                                Remove {m.name}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                {index < data.documents.length - 1 && (
                                    <Separator className="my-2.5"/>
                                )}
                            </Fragment>
                        );
                    })} 
                </CardContent>
        </Card>
    )
}