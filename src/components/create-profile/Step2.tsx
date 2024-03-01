import React, { useRef } from "react";
import { LeftOutlined } from "@ant-design/icons";
import { usePrivy } from "@privy-io/react-auth";
import { profileActions } from "@/src/redux/profile";
import { useDispatch } from "react-redux";
import editProfile from "@/src/utils/editProfile";
import { IUser } from "@/src/types";

interface IStep2Props {
  step: number;
  isSubmitting: boolean;
  bio: string;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  submitForm: () => void;
  wallet: string;
}

const Step2 = ({
  step,
  isSubmitting,
  setStep,
  submitForm,
  bio,
  wallet,
}: IStep2Props) => {
  const { user, linkEmail, linkGithub, linkWallet } = usePrivy();
  const dispatch = useDispatch();
  const bioTimeoutId = useRef<any>(0);

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    submitForm();
  };

  return (
    <>
      <div className={`flex-1 ${step === 2 ? "block" : "hidden"}`}>
        <label
          className="block text-gray-300 tracking-widest text-sm font-bold mb-2"
          htmlFor="email"
        >
          Email
        </label>
        {user?.email?.address ? (
          <p className="mb-5">{user.email.address}</p>
        ) : (
          <button
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight hover:border-[#2F45C6]  mb-5 `}
            onClick={linkEmail}
          >
            Link Email
          </button>
        )}

        <label
          className="block text-gray-300 tracking-widest text-sm font-bold mb-2"
          htmlFor="github"
        >
          Bio
        </label>

        <textarea
          id="bio"
          className={`shadow appearance-none border rounded w-full py-2 px-3 border-[#434343] focus:border-[#2F45C6] bg-black text-gray-300 leading-tight focus:outline-none focus:shadow-outline mb-5`}
          rows={5}
          placeholder="Description"
          value={bio}
          onChange={(e) => {
            const value = e.target.value;
            clearTimeout(bioTimeoutId.current);
            bioTimeoutId.current = setTimeout(async () => {
              try {
                const { data } = await editProfile<IUser>({
                  bio: value
                });
            
                if (data) {
                  dispatch(profileActions.setUser(data));
                }
              } catch (error) {
                // 
              }
            }, 2000);
            dispatch(profileActions.setBio(value));
          }}
          required
        />

        <label
          className="block text-gray-300 tracking-widest text-sm font-bold mb-2"
          htmlFor="github"
        >
          Github
        </label>
        {user?.github?.username ? (
          <p className="mb-5">{user?.github?.username}</p>
        ) : (
          <button
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight hover:border-[#2F45C6] mb-5`}
            onClick={linkGithub}
          >
            Link Github
          </button>
        )}
        <label
          className="block tracking-widest text-gray-300 text-sm font-bold mb-2"
          htmlFor="lens"
        >
          Wallet Address
        </label>
        {wallet ? (
          <p className="mb-5">@{wallet}</p>
        ) : (
          <button
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight hover:bg-white hover:text-darkBlue mb-5"
            onClick={linkWallet}
          >
            Set Wallet
          </button>
        )}

        <div className="flex justify-between items-center">
          <button
            className="border border-white text-white font-bold py-2 px-4 rounded mt-5 mr-2"
            onClick={prevStep}
          >
            <LeftOutlined className="text-sm" /> Prev
          </button>
          <button
            className={`bg-purple hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Step2;
