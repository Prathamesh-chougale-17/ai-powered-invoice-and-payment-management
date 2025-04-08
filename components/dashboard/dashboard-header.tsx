interface DashboardHeaderProps {
    title: string;
    description?: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-muted-foreground mt-1">{description}</p>
                )}
            </div>
        </div>
    );
}