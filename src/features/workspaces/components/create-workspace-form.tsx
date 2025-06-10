import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { createWorkspacesSchema } from "../schemas";

import { Card,  CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";

interface CreateWorkspaceFormProp{
    onCancel: () => void;
}

export const CreateWorkspaceFormProp = ({ onCancel }: CreateWorkspaceFormProp) => {
    const form = useForm<z.infer<typeof createWorkspacesSchema>>({
        resolver: zodResolver(createWorkspacesSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = (values: z.infer<typeof createWorkspacesSchema>) => {
        console.log(values);
    };

    return (
        <Card>

        </Card>
)

};