"use client"

import React from 'react';
import { z } from 'zod';

import { FcGoogle} from 'react-icons/fc';
import { FaGithub} from 'react-icons/fa'; 
import { useForm} from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";

import Link from 'next/link';

import { signUpWithGithub, signUpWithGoogle } from '@/lib/oauth';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { DottedSeparator } from '@/components/dotted-line';
import { Input } from '@/components/ui/input';

import { loginSchema } from '../scheme';
import { useLogin } from '../api/use-login';


export const SignInCard = () => {
    const { mutate, isPending } = useLogin();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    }); 

    const onSubmit = (values: z.infer<typeof loginSchema>) => {
        mutate({json: values});
    }

    return (
        <Card className="w-full h-full md:w-[487px] border-none shadow-none">
            <CardHeader className="flex item-center justify-center text-center p-7">
                <CardTitle className="text-2xl">
                    Welcome Back!
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator/>
            </div>
            <CardContent className="p-7">
                <Form {...form}> 
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="Enter email address"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>       
                            )}
                        />  
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="password"
                                            placeholder="Enter password"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>       
                            )}
                        />
                        <Button variant="primary" disabled={isPending} size="lg" className="w-full">
                            Login
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <div className="px-7">
                <DottedSeparator/>
            </div>
            <CardContent className="p-7 flex flex-col gap-y-4">
                <Button variant="secondary"
                        size="lg"
                        disabled={isPending}
                        className="w-full"
                        onClick={() => signUpWithGoogle()}
                        >
                    <FcGoogle className="mr-2 size-5"/>
                    Login with Google
                </Button>

                <Button variant="secondary"
                        size="lg"
                        disabled={isPending}
                        className="w-full"
                        onClick={() => signUpWithGithub()}
                        >
                    <FaGithub className="mr-2 size-5"/>
                    Login with Github
                </Button>
            </CardContent>
            <div className="px-7">
                <DottedSeparator/>
            </div>
            <CardContent className="p-7 flex items-center justify-center">
                <p>Don&apos;t have an account?</p>
                <Link href = "/sign-up">
                <span className="text-blue-700">&nbsp;Sign up</span>
                </Link>
            </CardContent>
        </Card>
    );
};

export default SignInCard;
