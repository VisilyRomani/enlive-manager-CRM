import Link from "next/link";
import { useRouter } from "next/router";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { useSession } from "next-auth/react";

export const BottomNavigation = () => {
  const session = useSession();
  const router = useRouter();
  return !!session.data?.user.company_id &&
    !["TEAMLEAD", "WORKER"].includes(session.data.user.user_role) ? (
    <div className="relative bottom-0 left-0 z-50 w-full h-16 border">
      <div className="justify-center items-center h-full">
        <Link href="/admin/company">
          <a className="h-full w-full">
            <div
              className={`flex justify-center items-center hover:bg-slate-200 h-full ${
                router.pathname.includes("company")
                  ? "bg-slate-200 text-violet-400"
                  : "text-gray-700"
              }`}
            >
              <MdOutlineAdminPanelSettings size={"40px"} />
            </div>
          </a>
        </Link>
      </div>
    </div>
  ) : (
    <></>
  );
};
