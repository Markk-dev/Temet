import { Loader } from "lucide-react"

const dashboardLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground"/>
    </div>

  )
}

export default dashboardLoader