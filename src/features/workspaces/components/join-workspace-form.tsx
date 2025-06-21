"use client"

import Link from "next/link";

import { DottedSeparator } from "@/components/dotted-line";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useInviteCode } from "../hooks/use-invite-code";
import { useJoinWorkspace } from "../api/use-join-workspace";
import { useWorkspaceId } from "../hooks/use-workspaceID";
import { useRouter } from "next/navigation";

interface joinWorkspaceFormProps{
    initialValues: {
        name: string; 
    }
}

export const JoinWorkspaceForm = ({
    initialValues,
}: joinWorkspaceFormProps) => {

    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const inviteCode = useInviteCode();
    const { mutate, isPending } = useJoinWorkspace();

    const onSubmit = () => {
        mutate({
            param:{ workspaceId },
            json: {code: inviteCode}
        }, {
            onSuccess: ({data}) => {
                router.push(`/workspaces/${data.$id}`);
            }
        })
    }

  return (
    <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="p-7">
            <CardTitle className="text-xl font-bold">
                Join Workspace
            </CardTitle>
            <CardDescription>
                You&apos;ve been invited to join <strong>{initialValues.name}</strong> workspace
            </CardDescription>
        </CardHeader>
        <div className="px-7">
            <DottedSeparator/>
        </div>
        <CardContent className="p-7">
            <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
                <Button 
                    variant={"secondary"}
                    size={"lg"}
                    type="button"
                    asChild
                    disabled={isPending}
                    className="w-full lg:w-fit"
                >
                    <Link href={"/"}>
                    Cancel
                    </Link>
                  
                </Button>
                <Button 
                    variant={"primary"}
                    className="w-full lg:w-fit"
                    size={"lg"}
                    type="button"
                    onClick={onSubmit}
                    disabled={isPending}
                >
                    Join Workspace
                </Button>
            </div>
        </CardContent>
    </Card>
  )
}

export default JoinWorkspaceForm