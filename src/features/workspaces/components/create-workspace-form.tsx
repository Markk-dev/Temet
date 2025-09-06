"use client"

import { z } from "zod";
import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { ImageIcon } from "lucide-react";

import { createWorkspacesSchema } from "../schemas";
import { useCreateWorkspace } from "../api/use-create-workspace";

import { Card,  CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormLabel, FormMessage, FormItem} from "@/components/ui/form";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DottedSeparator } from "@/components/dotted-line";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreateWorkspaceFormProp{
    onCancel ?: () => void;
}

export const CreateWorkspaceForm = ({ onCancel }: CreateWorkspaceFormProp) => {
    const router = useRouter();

    const { mutate, isPending, error } = useCreateWorkspace(); 

    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Add timeout to prevent getting stuck
    useEffect(() => {
        if (isPending) {
            timeoutRef.current = setTimeout(() => {
                console.error("Workspace creation timed out");
                // You could add a toast notification here
            }, 30000); // 30 second timeout
        } else {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [isPending]);

    const form = useForm<z.infer<typeof createWorkspacesSchema>>({
        resolver: zodResolver(createWorkspacesSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = (values: z.infer<typeof createWorkspacesSchema>) => {
        const finalValues = {
          ...values,
          image: values.image instanceof File ? values.image : "",
        };
      
        mutate(
          { form: finalValues },
          {
            onSuccess: ({data}) => {
              form.reset();
              // Use replace instead of push to prevent back button issues
              router.replace(`/workspaces/${data.$id}`);
            },
            onError: (error) => {
              console.error("Workspace creation failed:", error);
              // Don't reset form on error so user can try again
            },
          }
        );
      };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
            if(file){
                form.setValue("image", file)
            }
        }

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex p-7">
                <CardTitle className="text-xl font-bold">
                    Create new Workspace
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator/>
            </div>
            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Workspace Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field}
                                                placeholder="Enter workspace name"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
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
                                                        <ImageIcon className="size-[36px] text-neutral-400"/>
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className="flex flex-col">
                                                <p className="text-sm ">Workspace Icon</p>
                                                <p className="text-sm text-muted-foreground">JPG, PNG, SVG or JPEG max 1mb</p>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    ref={inputRef}
                                                    accept=".jpg, .jpeg, .png, .svg"
                                                    onChange={handleImageChange}
                                                    disabled={isPending}                                    
                                                />
                                                {field.value ? (
                                                <Button className="w-fit mt-2"
                                                 type="button" 
                                                 disabled={isPending} 
                                                 variant="deletion"
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
                                                    <Button className="w-fit mt-2"
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
                         <DottedSeparator className="py-7"/>
                         
                         {/* Error Display */}
                         {error && (
                             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                 <p className="text-sm text-red-600">
                                     Failed to create workspace. Please try again.
                                 </p>
                             </div>
                         )}
                         
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
                                {isPending ? "Creating..." : "Create Workspace"}
                            </Button>
                         </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
);

};