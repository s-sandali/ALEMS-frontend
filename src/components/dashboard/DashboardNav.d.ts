declare module "@/components/dashboard/DashboardNav" {
    type DashboardNavUser = {
        xpTotal?: number;
    };

    type DashboardNavProps = {
        user?: DashboardNavUser;
    };

    export default function DashboardNav(props: DashboardNavProps): JSX.Element;
}
