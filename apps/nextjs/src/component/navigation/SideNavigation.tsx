import Link from "next/link";
import { TbUsers } from "react-icons/tb";
import Image from "next/image";
import {
  AiOutlineSchedule,
  AiOutlineCheckSquare,
  AiOutlineContainer,
} from "react-icons/ai";
import { BsPhone } from "react-icons/bs";

import { CgToolbox } from "react-icons/cg";
import { HiOutlineBuildingOffice } from "react-icons/hi2";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export const SideNavigaton = () => {
  const session = useSession();
  const router = useRouter();
  const withClientId = (
    <div>
      <li className="relative">
        <Link href="/admin/client" prefetch={false}>
          <a>
            <div
              className={`flex flex-row items-center text-sm p-4 h-12 text-gray-700 text-ellipsis whitespace-nowrap rounded
            hover:bg-slate-200 hover:text-violet-400 ${
              router.pathname.includes("client")
                ? "bg-slate-200 text-violet-400"
                : "text-gray-700"
            }`}
            >
              <TbUsers size={"20px"} className="absolute" />
              <span className="left-8 hidden lg:group-hover:block relative py-3 mr-6">
                Manage Clients
              </span>
            </div>
          </a>
        </Link>
      </li>
      <li className="relative">
        <Link href="/admin/job" prefetch={false}>
          <a>
            <div
              className={`flex flex-row items-center text-sm p-4 h-12 text-gray-700 text-ellipsis whitespace-nowrap rounded hover:bg-slate-200 hover:text-violet-400 ${
                router.pathname.includes("job")
                  ? "bg-slate-200 text-violet-400"
                  : "text-gray-700"
              }`}
            >
              <AiOutlineCheckSquare size={"20px"} className="absolute" />
              <span className="left-8 hidden lg:group-hover:block relative py-3 mr-6">
                Manage jobs
              </span>
            </div>
          </a>
        </Link>
      </li>
      <li className="relative">
        <Link href="/admin/transaction" prefetch={false}>
          <a>
            <div
              className={`flex flex-row items-center text-sm p-4 h-12 text-gray-700 text-ellipsis whitespace-nowrap rounded hover:bg-slate-200 hover:text-violet-400 ${
                router.pathname.includes("transaction")
                  ? "bg-slate-200 text-violet-400"
                  : "text-gray-700"
              }`}
            >
              <AiOutlineContainer size={"20px"} className="absolute" />
              <span className="left-8 hidden lg:group-hover:block relative py-3 mr-6">
                Transactions
              </span>
            </div>
          </a>
        </Link>
      </li>
      <li className="relative">
        <Link href="/admin/schedule" prefetch={false}>
          <a>
            <div
              className={`flex flex-row  active:bg-gray-300 active:border-gray-400 items-center text-sm p-4 h-12 text-gray-700 text-ellipsis whitespace-nowrap rounded hover:bg-slate-200 hover:text-violet-400 ${
                router.pathname.includes("schedule")
                  ? "bg-slate-200 text-violet-400"
                  : "text-gray-700"
              } `}
            >
              <AiOutlineSchedule size={"20px"} className="absolute" />
              <span className="left-8 hidden lg:group-hover:block relative py-3 mr-6">
                Schedule
              </span>
            </div>
          </a>
        </Link>
      </li>
      <li className="relative">
        <Link href="/admin/config" prefetch={false}>
          <a>
            <div
              className={`flex flex-row  active:bg-gray-300 active:border-gray-400 items-center text-sm p-4 h-12 text-gray-700 text-ellipsis whitespace-nowrap rounded hover:bg-slate-200 hover:text-violet-400 ${
                router.pathname.includes("config")
                  ? "bg-slate-200 text-violet-400"
                  : "text-gray-700"
              } `}
            >
              <CgToolbox size={"20px"} className="absolute" />
              <span className="left-8 hidden lg:group-hover:block relative py-3 mr-6">
                Configuration
              </span>
            </div>
          </a>
        </Link>
      </li>
    </div>
  );

  return (
    <div
      className={`min-w-[60px] w-[60px] lg:hover:w-52 h-full group transition-width duration-100 ease-in shadow-md bg-white px-1 shrink-0`}
    >
      <ul className="relative h-full">
        <div className="flex flex-col justify-between h-full">
          <div>
            <li className="relative">
              <Link href="/admin/client" prefetch={false}>
                <a>
                  <div className="flex flex-row items-center h-20 text-gray-700 text-ellipsis rounded border-b border-gray-200 whitespace-nowrap ">
                    <div className="absolute h-[45px] w-[45px] my-4 mx-1">
                      <Image
                        width={45}
                        height={45}
                        alt=""
                        src={"/Enlive-Black.png"}
                      />
                    </div>
                    <span className="left-14 hidden lg:group-hover:block text-2lg font-bold relative py-3 mr-6 text-center ">
                      Enlive Manager
                    </span>
                  </div>
                </a>
              </Link>
            </li>

            <li className="relative">
              <Link href="/admin/company" prefetch={false}>
                <a>
                  <div
                    className={`flex flex-row items-center text-sm p-4 h-12 text-gray-700 text-ellipsis whitespace-nowrap rounded hover:bg-slate-200 hover:text-violet-400 ${
                      router.pathname.includes("company")
                        ? "bg-slate-200 text-violet-400"
                        : "text-gray-700"
                    }`}
                  >
                    <HiOutlineBuildingOffice
                      size={"20px"}
                      className="absolute"
                    />
                    <span className="left-8 hidden lg:group-hover:block relative py-3 mr-6">
                      Company
                    </span>
                  </div>
                </a>
              </Link>
            </li>

            {!!session.data?.user.company_id &&
              session.data.user.user_role !== "TEAMLEAD" &&
              withClientId}
          </div>

          {!!session.data?.user.company_id && (
            <li className="relative">
              <Link href="/app/job-group" prefetch={false}>
                <a>
                  <div
                    className={`flex flex-row items-center text-sm p-4 h-12 text-gray-700 text-ellipsis whitespace-nowrap rounded hover:bg-slate-200 hover:text-violet-400 ${
                      router.pathname.includes("job-group")
                        ? "bg-slate-200 text-violet-400"
                        : "text-gray-700"
                    }`}
                  >
                    <BsPhone size={"20px"} className="absolute" />
                    <span className="left-8 hidden lg:group-hover:block relative py-3 mr-6">
                      App
                    </span>
                  </div>
                </a>
              </Link>
            </li>
          )}
        </div>
      </ul>
    </div>
  );
};
