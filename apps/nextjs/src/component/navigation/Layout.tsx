import { useSession } from "next-auth/react";
import { SideNavigaton } from "./SideNavigation";

// eslint-disable-next-line @typescript-eslint/ban-types
export default function Layout({ children }: React.PropsWithChildren<{}>) {
  const session = useSession();
  return (
    <div className="flex flex-row h-screen w-screen">
      {session.status === "authenticated" && <SideNavigaton />}
      <>{children}</>
    </div>
  );
}
