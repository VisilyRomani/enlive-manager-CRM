import { useRouter } from "next/router";
import { BiArrowBack } from "react-icons/bi";

export const AppHeader = ({
  title,
  back,
}: {
  title: string;
  back: boolean;
}) => {
  const router = useRouter();

  return (
    <header className="bg-violet-300  p-2">
      <BiArrowBack
        className={`${!back ? "hidden" : ""} absolute`}
        onClick={() => {
          router.back();
        }}
        color="white"
        size={30}
      />
      <h1 className="text-xl  text-white text-center grow">{title}</h1>
    </header>
  );
};
