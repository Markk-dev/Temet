"use client";

import React from 'react';
import { z } from 'zod';

import { FcGoogle} from 'react-icons/fc';
import { FaGithub} from 'react-icons/fa';
import { useForm} from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import  Link  from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { DottedSeparator } from '@/components/dotted-line';
import { Input } from '@/components/ui/input';

import { registerSchema } from '../scheme';
import { useRegister } from '../api/use-register';


export const SignUpCard = () => {
    const { mutate, isPending } = useRegister();

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    }); 

    const onSubmit = (values: z.infer<typeof registerSchema>) => {
        mutate({json: values});
    }

  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
        <CardHeader className="flex item-center justify-center text-center p-7">
            <CardTitle className="text-2xl">
                Sign Up
            </CardTitle>
            <CardDescription>
                By signing up, you agree to our{" "}
                <Link href="/privacy">
                    <span className = "text-blue-700">Privacy Policy</span>
                </Link>{" "}
                and{" "}
                <Link href="/terms">
                    <span className = "text-blue-700">Terms and Service</span>
                </Link>

            </CardDescription>
        </CardHeader>
        <div className="px-7">
            <DottedSeparator/>
        </div>
        <CardContent className="p-7">
            <Form {...form}> 
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                            name="name"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Enter your name"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>       
                            )}
                    />
                    <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="Enter your email address"
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
                                            placeholder="Enter your password"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>       
                            )}
                        /> 

                    <Button variant="primary" disabled={isPending} size="lg" className="w-full">
                        Register
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
                        className="w-full">
                    <FcGoogle className="mr-2 size-5"/>
                    Login with Google
                </Button>

                <Button variant="secondary"
                        size="lg"
                        disabled={isPending}
                        className="w-full">
                    <FaGithub className="mr-2 size-5"/>
                    Login with Github
                </Button>
            </CardContent>
                <div className="px-7">
                    <DottedSeparator/>
                </div>
                <CardContent className="p-7 flex items-center justify-center">
                    <p>Already have an account?</p>
                    <Link href = "/sign-in">
                    <span className="text-blue-700">&nbsp;Sign in</span>
                    </Link>
                </CardContent>
    </Card>
  );
};

export default SignUpCard;
 