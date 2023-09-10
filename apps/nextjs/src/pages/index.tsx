import { getSession, signIn, signOut } from "next-auth/react";
import Head from "next/head";
import RadiantButton from "../component/input/RadiantButton";
import Link from "next/link";
import Image from "next/image";
import { GetServerSidePropsContext } from "next";
import { Session } from "next-auth";

const Home = ({ session }: { session: Session }) => {
  return (
    <>
      <Head>
        <title>Enlive Management</title>
        <meta
          name="description"
          content="Create and manage your company's information"
        />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <main className="container flex flex-col items-center min-h-screen py-16 mx-auto">
        <div className="flex justify-center items-center">
          <div className="bg-white rounded-lg p-8 flex flex-col gap-5">
            <div className="w-full justify-center flex">
              <Image
                width={200}
                priority
                height={200}
                src={"/Enlive-Black.png"}
                alt="Enlive Manager"
                className="w-48 mx-auto mb-4"
              />
            </div>
            <h1 className="text-4xl font-bold text-center mb-4 text-purple-700">
              Enlive Manager
            </h1>
            <p className="text-lg text-center mb-8 text-gray-600">
              The ultimate business management software.
            </p>
            {!!session ? (
              <div className="flex justify-center flex-col gap-3">
                <Link href="/admin/company">
                  <a>
                    <RadiantButton className="w-full">To Company</RadiantButton>
                  </a>
                </Link>
                <RadiantButton onClick={() => signOut()}>logout</RadiantButton>
              </div>
            ) : (
              <button
                className="bg-purple-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-900 w-full"
                onClick={() =>
                  signIn("google", {
                    callbackUrl: `${window.location.origin}/admin/company`,
                  })
                }
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export async function getServerSideProps(
  context: GetServerSidePropsContext<never>
) {
  const session = await getSession(context);

  return {
    props: { session },
  };
}

export default Home;
