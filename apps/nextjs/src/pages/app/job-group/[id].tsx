import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { trpc } from "../../../utils/trpc";
import { useEffect } from "react";
import RadiantButton from "../../../component/input/RadiantButton";
import { AppHeader } from "../../../component/AppHeader";
import Spinner from "../../../component/Spinner";
import Link from "next/link";

const Job = () => {
  const { data, mutate, isLoading } = trpc.schdule.getNextJob.useMutation();
  const router = useRouter();
  useEffect(() => {
    mutate({
      schedule_id: router.query.id as string,
      completed_job_id: null,
    });
  }, [mutate, router.query.id]);

  useEffect(() => {
    if (data === "COMPLETED") {
      router.back();
    }
  }, [data, router]);

  if (data !== "COMPLETED") {
    return (
      <main className="h-full w-full flex flex-col overflow-hidden">
        <AppHeader title="Job" back={true} />
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="flex flex-col overflow-hidden justify-between h-full w-full">
            <div className="p-6 border border-gray-200 rounded-lg shadow">
              <h1 className="text-center text-3xl text-gray-600 font-bold">
                {`${data?.address.client.first_name} ${data?.address.client.last_name}`}
              </h1>
              <a
                className="bg-slate-400"
                href={`https://www.google.com/maps/search/?api=1&query=${
                  data?.address.address.replaceAll(" ", "+") +
                  "%2C" +
                  data?.address.city.replaceAll(" ", "+")
                }`}
              >
                <>
                  <p className="text-center text-1xl">{data?.address.city}</p>
                  <p className="text-center text-1xl">
                    {data?.address.address}
                  </p>
                </>
              </a>
            </div>

            <div className="flex flex-col grow overflow-hidden ">
              <h1 className="text-gray-600 font-bold text-xl pl-3 mx-2 mt-2">
                Tasks:
              </h1>
              <div className="overflow-auto h-full bg-slate-100">
                {data?.job_task.map(({ product_service }, idx) => {
                  return (
                    <div
                      key={idx}
                      className="m-2 px-3 py-5 bg-white border-gray-200 mb-1 shadow rounded-sm"
                    >
                      <p className="text-sm text-gray-600">
                        {product_service.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-40 bg-white border-gray-200 rounded-lg">
              <h1 className="text-gray-600 font-bold text-xl pl-3 mx-2">
                Notes:
              </h1>
              <p className="px-3 text-gray-600 text-sm overflow-auto h-36">
                {data?.job_note}
              </p>
            </div>
            {data?.job_id && (
              <Link href={`/admin/job/${data?.job_id}`}>
                <a>
                  <RadiantButton className="rounded m-3 h-14">
                    Job Info
                  </RadiantButton>
                </a>
              </Link>
            )}
            <RadiantButton
              className="rounded m-3 h-14"
              onClick={() => {
                mutate({
                  schedule_id: router.query.id as string,
                  completed_job_id: data?.job_id ?? null,
                });
              }}
            >
              Next Job
            </RadiantButton>
          </div>
        )}
      </main>
    );
  }
};
export default Job;

export async function getServerSideProps(
  context: GetServerSidePropsContext<never>
) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  } else if (!session?.user?.company_id) {
    return {
      redirect: {
        destination: "/admin/company",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

// export const Job = ({ route, navigation }: Props) => {
//   const { data, mutate } = trpc.schdule.getNextJob.useMutation();

//   useEffect(() => {
//     mutate({
//       schedule_id: route.params.schedule_id,
//       completed_job_id: null,
//     });
//   }, []);

//   useEffect(() => {
//     if (data === "COMPLETED") {
//       navigation.goBack();
//     }
//   }, [data]);

//   if (data !== "COMPLETED") {
//     return (
//       <View className="flex flex-col justify-between h-full">
//         <View className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow">
//           <Typography className="text-center text-3xl">
//             {`${data?.address.clients.first_name} ${data?.address.clients.last_name}`}
//           </Typography>
//           <TouchableOpacity
//             onPress={() => {
//               Linking.openURL(
//                 `geo:0,0?q=${data?.address.address}, ${data?.address.city}`
//               );
//             }}
//           >
//             <Typography className="text-center text-1xl">
//               {data?.address.city}
//             </Typography>
//             <Typography className="text-center text-1xl">
//               {data?.address.address}
//             </Typography>
//           </TouchableOpacity>
//         </View>
//         <FlatList
//           className="bg-gray-100"
//           stickyHeaderIndices={[0]}
//           ListHeaderComponent={() => {
//             return (
//               <View
//                 style={{
//                   backgroundColor: "#fff",
//                   shadowColor: "#000",
//                   shadowOffset: { width: 1, height: 1 },
//                   shadowOpacity: 0.4,
//                   shadowRadius: 3,
//                   elevation: 5,
//                 }}
//                 className="mb-1"
//               >
//                 <Typography className="text-xl text-center">
//                   Task List
//                 </Typography>
//               </View>
//             );
//           }}
//           data={data?.job_task}
//           renderItem={({ item }) => {
//             return (
//               <View className="block max-w-sm p-1 bg-white border-b border-gray-200 mb-1 shadow">
//                 <Typography className="text-md">
//                   {item.product_service.name}
//                 </Typography>
//               </View>
//             );
//           }}
//         />
//         <View className="h-40 block max-w-sm bg-white border border-gray-200 rounded-lg shadow">
//           <Typography className="text-xl">Notes:</Typography>
//           <ScrollView>
//             <Typography className="p-1 text-lg">{data?.job_note}</Typography>
//           </ScrollView>
//         </View>
//         <Pressable
//           className="bg-black py-2 item-center rounded-lg"
//           onPress={() => {
//             mutate({
//               schedule_id: route.params.schedule_id,
//               completed_job_id: data?.job_id ?? null,
//             });
//           }}
//         >
//           <Typography className="text-white text-center text-2xl">
//             Next Job
//           </Typography>
//         </Pressable>
//       </View>
//     );
//   }
// };
