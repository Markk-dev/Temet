"use client"

import { z } from "zod";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon, CopyIcon, ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Workspace } from "../types";
import { UseConfirm } from "@/hooks/use-confirm";
import { useUpdateWorkspace } from "../api/use-update-workspace";

import { updateWorkspacesSchema } from "../schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormLabel, FormMessage, FormItem } from "@/components/ui/form";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DottedSeparator } from "@/components/dotted-line";
import { Button } from "@/components/ui/button";

import { useMedia } from "react-use";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useDeleteWorkspace } from "../api/use-delete-workspace";
import { useResetInviteCode } from "../api/use-reset-invite-code";
import { useEffect } from "react";


interface EditWorkspaceFormProp {
  onCancel?: () => void;
  initialValues: Workspace;
}

export const EditWorkspaceForm = ({ onCancel, initialValues }: EditWorkspaceFormProp) => {
  const router = useRouter();
  const { mutate, isPending } = useUpdateWorkspace();

  const { mutate: deleteWorkspace, isPending: isDeletingWorkspace } = useDeleteWorkspace();
  const { mutate: resetInviteCode, isPending: isResettingInviteCode } = useResetInviteCode();

  const [DeleteDialog, confirmDelete] = UseConfirm(
    "Delete Workspace",
    "This action cannot be undone",
    "deletion",
  );
  
  const [ResetDialog, confirmReset] = UseConfirm(
    "Reset invite link",
    "This action will invalidate the current link and generate a new one",
    "deletion",
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const isOnDesktop = useMedia("(min-width: 1024px)", true);
  const form = useForm<z.infer<typeof updateWorkspacesSchema>>({
    resolver: zodResolver(updateWorkspacesSchema),
    defaultValues: {
      ...initialValues,
      image: initialValues.imageUrl ?? "",
    },
  });

  const [workspaceName, setWorkspaceName] = useState(initialValues.name);

  useEffect(() => {
    setWorkspaceName(initialValues.name);
    form.reset({
      ...initialValues,
      image: initialValues.imageUrl ?? "",
    });
  }, [initialValues, form]);

  const handleDelete = async () => {
    const ok = await confirmDelete();
    
    if(!ok) return;

    deleteWorkspace({
      param: { workspaceId: initialValues.$id },
    },{
      onSuccess: () => {
        router.push("/");
      } 
    })
  }

  const handleResetInviteCode = async () => {
    const ok = await confirmReset();
    
    if(!ok) return;

    resetInviteCode({
      param: { workspaceId: initialValues.$id },
    });
  }

  const onSubmit = (values: z.infer<typeof updateWorkspacesSchema>) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : ""
    };

    mutate(
      {
        form: finalValues,
        param: { workspaceId: initialValues.$id }
      },
      {
        onSuccess: async (data) => {
          setWorkspaceName(data.data.name);
          //
          router.push(`/workspaces/${initialValues.$id}`)
        },
      }
    ); 
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("image", file);
    }
  };

  const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`;

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(fullInviteLink)
    .then(() => toast.success("Invite link copied to clipboard"));
  };


  const FormContent = (
    <div className="flex flex-col items-center gap-y-4">
      <DeleteDialog/>
      <ResetDialog/>
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.$id}`)}
          >
            <ArrowLeftIcon className="size-4 mr-2" />
            Back
          </Button>
          <CardTitle className="text-xl font-bold">
            {workspaceName}
          </CardTitle>
        </CardHeader>

        <div className="px-7">
          <DottedSeparator />
        </div>

        <CardContent className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-y-4">
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workspace Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter workspace name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Upload */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <div className="flex flex-col gap-y-2">
                      <div className="flex items-center gap-x-5">
                        {field.value ? (
                          <div className="size-[72px] relative rounded-md overflow-hidden">
                            <Image
                              alt="Logo"
                              fill
                              className="object-cover"
                              src={
                                field.value instanceof File
                                  ? URL.createObjectURL(field.value)
                                  : field.value
                              }
                            />
                          </div>
                        ) : (
                          <Avatar className="size-[72px]">
                            <AvatarFallback>
                              <ImageIcon className="size-[36px] text-neutral-400" />
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className="flex flex-col">
                          <p className="text-sm">Workspace Icon</p>
                          <p className="text-sm text-muted-foreground">
                            JPG, PNG, SVG or JPEG max 1mb
                          </p>
                          <input
                            type="file"
                            className="hidden"
                            ref={inputRef}
                            accept=".jpg, .jpeg, .png, .svg"
                            onChange={handleImageChange}
                            disabled={isPending}
                          />
                          {field.value ? (
                            <Button
                              className="w-fit mt-2"
                              type="button"
                              disabled={isPending}
                              variant="quaternary"
                              size="xs"
                              onClick={() => {
                                field.onChange(null);
                                if (inputRef.current) {
                                  inputRef.current.value = "";
                                }
                              }}
                            >
                              Remove Image
                            </Button>
                          ) : (
                            <Button
                              className="w-fit mt-2"
                              type="button"
                              disabled={isPending}
                              variant="tertiary"
                              size="xs"
                              onClick={() => inputRef.current?.click()}
                            >
                              Upload Images
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>

              <DottedSeparator className="py-7" />

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isPending}
                  className={cn(!onCancel && "invisible")}
                >
                  Cancel
                </Button>
                <Button type="submit" size="lg" variant="primary" disabled={isPending}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full h-full border-none shadow-none p-1">
        <CardContent className="p-4">
          <div className="flex flex-col">
            <h3 className="font-bold">Invite Members</h3>
              <p className="text-sm text-muted-foreground mt-2">
              Use the invite link to add members to your workspace
              </p>
              <div className="mt-4">
                <div className="flex items-center gap-x-2">
                  <Input disabled value={fullInviteLink}/>
                  <Button
                    onClick={handleCopyInviteLink}
                    variant="secondary"
                    className="size-12"
                  >
                    <CopyIcon className="size-5"/>
                  </Button>
                </div>
              </div>
              <DottedSeparator className="py-7"/>
              <Button
                className=" mt-[-10px] w-fit ml-auto px-5"
                size="sm"
                variant="deletion"
                type="button"
                disabled={isPending || isResettingInviteCode }
                onClick={handleResetInviteCode}
                >
                Reset Invite link
              </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full h-full border-none shadow-none p-1 bg-dangerzone">
        <CardContent className="p-4">
          <div className="flex flex-col">
            <h4 className="font-bold">Danger Zone</h4>
            <div className="flex">
              <p className="text-xs text-muted-foreground mt-2">
              This action is irreversible and will permanently delete all workspace data.
              </p>
              <Button
                className="w-fit ml-auto"
                size="sm"
                variant="deletion"
                type="button"
                disabled={isPending || isDeletingWorkspace}
                onClick={handleDelete}
                >
                Delete Workspace
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isOnDesktop) return FormContent;

  return (
    <Drawer open onOpenChange={() => router.push(`/workspaces/${initialValues.$id}`)}>
      <DrawerContent>
        <div className="p-4 overflow-y-auto max-h-[85vh]">
          {FormContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
  