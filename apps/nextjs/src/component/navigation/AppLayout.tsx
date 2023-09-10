import { useSession } from "next-auth/react";
import { BottomNavigation } from "./BottomNavigation";

// eslint-disable-next-line @typescript-eslint/ban-types
export default function AppLayout({ children }: React.PropsWithChildren<{}>) {
  const session = useSession();
  return (
    <div className="flex flex-col h-screen w-screen">
      <>{children}</>
      {session.status === "authenticated" && <BottomNavigation />}
    </div>
  );
}
