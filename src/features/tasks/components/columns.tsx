"use client";

import { ArrowUpDown, MoreVertical } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MemberAvatar } from "@/features/members/components/members-avatar";

import { Task } from "../types";
import { TaskDate } from "./task-date";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { TaskActions } from "./task-actions";

import { useCurrent } from "@/features/auth/api/use-current";

type Member = { $id: string; name: string; userId?: string; /* other fields */ };

// New component for the actions cell
const TaskActionsCell = ({ id, projectId, assignees }: { id: string, projectId: string, assignees: Member[] }) => {
  const { data: currentUser } = useCurrent();
  const isAssignee = assignees?.some(
    (a: Member) => a.userId === currentUser?.$id || a.$id === currentUser?.$id
  );
  return (
    <TaskActions id={id} projectId={projectId} disabled={!isAssignee}>
      <Button variant="ghost" className="size-8 p-0">
        <MoreVertical className="size-4"/>
      </Button>
    </TaskActions>
  );
};

export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Task Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            )
          },
          cell: ({row}) => {
            const name = row.original.name;

            return <p className="break-words whitespace-pre-line max-w-xs">{name}</p>
          }
    },
    {
        accessorKey: "project",
        header: ({column}) => {
            return (
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                  Project
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              )
        },
        cell: ({row}) => {
            const project = row.original.project;

            return (
                <div className="flex items-center gap-x-2 text-sm font-medium">
                    <ProjectAvatar
                        className="size-6"
                        name={project.name}
                        image={project.imageUrl}
                    />
                    <p className="line-clamp-1">{project.name}</p>
                </div>
            )
        }
    },
    {
        accessorKey: "assignee",
        header: ({column}) => {
            return (
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                  Assignee
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              )
        },
        cell: ({row}) => {
            const assignees = row.original.assignees;

            return (
                <div className="flex flex-col items-start justify-start gap-2 text-xs font-medium">
                    {assignees?.length
                      ? assignees.map((a: Member) => (
                          <div key={a.$id} className="flex gap-x-2">
                            <MemberAvatar name={a.name} />
                            <p>{a.name}</p>
                          </div>
                        ))
                      : <span>Unassigned</span>
                    }
                </div>
            )
        }
    },
    {
        accessorKey: "dueDate",
        header: ({column}) => {
            return (
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                  Due Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              )
        },
        cell: ({row}) => {
            const dueDate = row.original.dueDate;

            return (
                <div className="flex items-start justify-start gap-2 text-sm w-full">
                    <TaskDate value={dueDate} />
                </div>
            )
        }
    },
    {
        accessorKey: "status",
        header: ({column}) => {
            return (
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              )
        },
        cell: ({row}) => {
            const status = row.original.status;

            return (
                <div className="flex">
                    <Badge variant={status}>{snakeCaseToTitleCase(status)}</Badge>
                </div>

            ) 
        }
    },
    {
        id: "actions",
        cell: ({row}) => {
            const id = row.original.$id;
            const projectId = row.original.projectId;
            const assignees = row.original.assignees;
            return <TaskActionsCell id={id} projectId={projectId} assignees={assignees} />;
        }
    }
];
