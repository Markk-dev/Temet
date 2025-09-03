import { IoIosTrendingUp, IoIosTrendingDown } from "react-icons/io"
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";

interface AnalyticsCardProps {
    title: string;
    value: number;
    variant: "up" | "down";
    increaseValue: number;
    icon?: ReactNode;
}

export const AnalyticsCard = ({
    title,
    value,
    variant,
    increaseValue,
    icon,
}: AnalyticsCardProps) => {
    const iconColor = variant === "up" ? "text-emerald-500" : "text-red-500";
    const increaseValueColor = variant === "up" ? "text-emerald-500" : "text-red-500";
    const Icon = variant === "up" ? IoIosTrendingUp : IoIosTrendingDown;

    return (
        <Card className="shadow-none border-none w-full"> 
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-2.5">
                        <CardDescription className="flex items-center gap-x-2 font-medium overflow-hidden">
                            <span className="truncate text-sm">{title}</span>
                        </CardDescription>
                        <div className="flex items-center gap-x-1">
                            <Icon className={cn(iconColor, "size-4")}/>
                            <span className={cn(increaseValueColor, "truncate text-base font-base")}>
                                {increaseValue}
                            </span>
                        </div>
                    </div>
                    {icon && (
                        <div className="hidden lg:block ml-4">
                            {icon}
                        </div>
                    )}
                </div>
                <CardTitle className="text-2xl font-semibold -mt-4">
                  {value}
                </CardTitle>
            </CardHeader>
        </Card>
    )
}