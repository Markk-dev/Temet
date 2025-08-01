"use client"

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { ImageIcon } from "lucide-react";

import { useCreateProject } from "../api/use-create-project";

import { createProjectSchema } from "../schema";
import { Card,  CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormLabel, FormMessage, FormItem} from "@/components/ui/form";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DottedSeparator } from "@/components/dotted-line";
import { Button } from "@/components/ui/button";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";

// Create a type for the form data (excluding workspaceId)
type CreateProjectFormData = {
    name: string;
    image?: File | string;
};

interface CreateProjectFormProp{
    onCancel ?: () => void;
}

export const CreateProjectForm = ({ onCancel }: CreateProjectFormProp) => {
    const workspaceID = useWorkspaceId();
    const router = useRouter();

    const { mutate, isPending } = useCreateProject(); 

    const inputRef = useRef<HTMLInputElement>(null);

    const form = useForm<CreateProjectFormData>({
        resolver: zodResolver(createProjectSchema.omit({workspaceId: true})),
        defaultValues: {
            name: "",
        },
    });
    

    const onSubmit = (values: CreateProjectFormData) => {
        const finalValues = {
          ...values,
          workspaceId: workspaceID, 
          image: values.image instanceof File ? values.image : "",
        };
      
        mutate(
          { form: finalValues },
          {
            onSuccess: ({data}) => {
              form.reset();
              router.push(`/workspaces/${workspaceID}/projects/${data.$id}`)
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
                    Create new project
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
                                            Project Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field}
                                                placeholder="Enter project name"
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
                                                <p className="text-sm ">Project Icon</p>
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
                                Create Project
                            </Button>
                         </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
);

};