import { ProjectIdClient } from "./client";

import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";

const ProjectIdPage = async () => {

    const user = await getCurrent();
    if(!user) redirect("/sign-in");

    return <ProjectIdClient/>
}

export default ProjectIdPage;