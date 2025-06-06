import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { DottedSeparator } from '@/components/dotted-line';
import { Input } from '@/components/ui/input';

const SignInCard = () => {
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
            <form className="space-y-4">
                <Input
                    required
                    type = "email"
                    value = {""}
                    onChange={() => {}}
                    placeholder = "Enter email address"
                    disabled={false}
                />

                <Input
                    required
                    type = "password"
                    value = {""}
                    onChange={() => {}}
                    placeholder = "Enter password"
                    disabled={false}
                    min={8}
                    max={256}
                />
                <Button variant="primary" disabled={false} size="lg" className="w-full">
                    Login
                </Button>
            </form>
        </CardContent>
        <div className=""> </div>
    </Card>
  );
};

export default SignInCard;
 