import { ScrollArea, ScrollBar} from "./ui/scroll-area"
import { AnalyticsCard } from "./analytics-card"
import { ClipboardList, Clock, CheckCircle, AlertTriangle, MinusCircle } from "lucide-react"

import { ProjectAnalyticsResponseType } from "@/features/projects/api/use-get-project-analytics"

import { DottedSeparator } from "./dotted-line"


export const Analytics = ({data}: ProjectAnalyticsResponseType) => {
    return (
        <ScrollArea className="border rounded-lg w-full whitespace-nowrap shrink-0">
                <div className="w-full flex flex-row">
                    <div className="flex items-center flex-1">
                        <AnalyticsCard 
                            title="Total Tasks"
                            value={data.taskCount}
                            variant={data.taskDifference > 0 ? "up" : "down"}
                            increaseValue={data.taskDifference}
                            icon={<div className="p-1.5 rounded-md bg-blue-100"><ClipboardList className="w-4 h-4 text-blue-500" /></div>}
                        />
                        <DottedSeparator direction="vertical"/>
                    </div>
                    <div className="flex items-center flex-1">
                        <AnalyticsCard 
                            title="Assigned Tasks"
                            value={data.assignedTaskCount}
                            variant={data.assignedTaskDifference > 0 ? "up" : "down"}
                            increaseValue={data.assignedTaskDifference}
                            icon={<div className="p-1.5 rounded-md bg-orange-100"><Clock className="w-4 h-4 text-orange-500" /></div>}
                        />
                        <DottedSeparator direction="vertical"/>
                    </div>
                    <div className="flex items-center flex-1">
                        <AnalyticsCard 
                            title="Completed Tasks"
                            value={data.completedTaskCount}
                            variant={data.completedTaskDifference > 0 ? "up" : "down"}
                            increaseValue={data.completedTaskDifference}
                            icon={<div className="p-1.5 rounded-md bg-green-100"><CheckCircle className="w-4 h-4 text-green-500" /></div>}
                        />
                        <DottedSeparator direction="vertical"/> 
                    </div>
                    <div className="flex items-center flex-1">
                        <AnalyticsCard 
                            title="Overdue Tasks"
                            value={data.overdueTaskCount}
                            variant={data.overdueTaskDifference > 0 ? "up" : "down"}
                            increaseValue={data.overdueTaskDifference}
                            icon={<div className="p-1.5 rounded-md bg-red-100"><AlertTriangle className="w-4 h-4 text-red-500" /></div>}
                        />
                        <DottedSeparator direction="vertical"/> 
                    </div>
                    <div className="flex items-center flex-1">
                        <AnalyticsCard 
                            title="Incomplete Tasks"
                            value={data.incompleteTaskCount}
                            variant={data.incompleteTaskDifference > 0 ? "up" : "down"}
                            increaseValue={data.incompleteTaskDifference}
                            icon={<div className="p-1.5 rounded-md bg-yellow-100"><MinusCircle className="w-4 h-4 text-yellow-500" /></div>}
                        />
                    </div>
                </div>
            <ScrollBar orientation="horizontal"/>
        </ScrollArea>
    )

}