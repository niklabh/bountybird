import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";

const AuthPage = () => {
  const { login } = usePrivy();

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-darkBlue text-accent p-8 rounded-lg shadow-lg max-w-xs mr-8 w-full">
        <div className="flex justify-center mb-6">
          <Image src="/assets/logo.svg" alt="logo" width={100} height={100} />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-4">
          Welcome to Bounty Bird!
        </h2>
        <p className="text-gray-300 text-center mb-6">
          Discover, participate, and manage bounties for various projects.
        </p>

        <button
          type="submit"
          className="w-full bg-white text-darkBlue px-4 py-2 rounded-lg hover:bg-purple hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          onClick={login}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
