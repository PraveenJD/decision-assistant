import Lottie from "lottie-react";

import { animationData } from "./dataLanding";
import { FC } from "react";

type LoaderProps = {
  loaderMessage?: string;
};

const Loader: FC<LoaderProps> = ({ loaderMessage = "" }) => {
  return (
    <div className="h-[calc(100vh-5rem)] w-full bg-black opacity-70 flex flex-col justify-center items-center absolute top-0 left-0 pb-36 z-50">
      <Lottie animationData={animationData} loop autoPlay />
      {loaderMessage ? (
        <p className="text-xl text-white font-semibold mt-5">{loaderMessage}</p>
      ) : null}
    </div>
  );
};

export default Loader;
