import React, { useRef, useState } from "react";
import { RightOutlined } from "@ant-design/icons";
import ConnectLensModal from "../ConnectLensModal";
import { usePrivy } from "@privy-io/react-auth";
import { useDispatch } from "react-redux";
import { profileActions } from "@/src/redux/profile";
import editProfile from "@/src/utils/editProfile";
import { IUser } from "@/src/types";
import LinkLens from "./LinkLens";

interface IStep1Props {
  step: number;
  username: string;
  displayName: string;
  twitterHandle: string;
  lensHandle: string;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

const Step1 = ({
  step,
  setStep,
  username,
  displayName,
  lensHandle,
  twitterHandle,
}: IStep1Props) => {
  const { linkTwitter } = usePrivy();
  const dispatch = useDispatch();
  const nameTimeoutId = useRef<any>(0);
  const usernameTimeoutId = useRef<any>(0);

  const [errors, setErrors] = useState({
    displayName: "",
    username: "",
  });

  const [formError, setFormError] = useState("");

  const onLinkTwitter = () => {
    linkTwitter();
  }

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = { ...errors };
    if (displayName.trim() === "") {
      newErrors.displayName = "Display Name is required";
      isValid = false;
    } else {
      newErrors.displayName = "";
    }

    if (username.trim() === "") {
      newErrors.username = "Username is required";
      isValid = false;
    } else {
      newErrors.username = "";
    }

    let newFormError = formError;

    if (!twitterHandle && !lensHandle) {
      newFormError = "Either twitter or lens is required";
      isValid = false;
    } else {
      newFormError = "";
    }

    setFormError(newFormError);
    setErrors(newErrors);

    return isValid;
  };

  return (
    <>
      <div className={`flex-1 font-poppins ${step === 1 ? "block" : "hidden"}`}>
        <label
          className="block text-gray-300 tracking-widest text-sm font-bold mb-2"
          htmlFor="displayName"
        >
          Display Name <span className="text-red-500">*</span>
          {errors.displayName && (
            <p className="text-red-500 text-xs italic inline-block ml-2">
              {errors.displayName}
            </p>
          )}
        </label>
        <input
          id="displayName"
          className={`shadow appearance-none border border-[#434343] focus:border-[#2F45C6] bg-black rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline mb-5 ${
            errors.displayName ? "border-red-500" : ""
          }`}
          type="text"
          placeholder="BountyMaster"
          value={displayName}
          onChange={(e) => {
            const value = e.target.value;
            clearTimeout(nameTimeoutId.current);
            nameTimeoutId.current = setTimeout(async () => {
              try {
                const { data } = await editProfile<IUser>({
                  name: value
                });
            
                if (data) {
                  dispatch(profileActions.setUser(data));
                }
              } catch (error) {
                // 
              }
            }, 2000);
            dispatch(profileActions.setName(value));
          }}
          required
        />

        <label
          className="block text-gray-300 tracking-widest text-sm font-bold mb-2"
          htmlFor="username"
        >
          Username <span className="text-red-500">*</span>
          {errors.username && (
            <p className="text-red-500 text-xs italic inline-block ml-2">
              {errors.username}
            </p>
          )}
        </label>
        <input
          id="username"
          className={`shadow appearance-none border rounded w-full py-2 px-3 border-[#434343] focus:border-[#2F45C6] bg-black text-gray-300  leading-tight focus:outline-none focus:shadow-outline mb-5 ${
            errors.username ? "border-red-500" : ""
          }`}
          type="text"
          placeholder="bounty_master007"
          value={username}
          onChange={(e) => {
            const value = e.target.value;
            clearTimeout(usernameTimeoutId.current);
            usernameTimeoutId.current = setTimeout(async () => {
              try {
                const { data } = await editProfile<IUser>({
                  username: value
                });
            
                if (data) {
                  dispatch(profileActions.setUser(data));
                }
              } catch (error) {
                // 
              }
            }, 2000);
            dispatch(profileActions.setUsername(value));
          }}
          required
        />
        {formError && (
          <p className="w-full text-red-500 border border-red-500 bg-red-100 p-2 mb-5 text-xs italic inline-block">
            {formError}!
          </p>
        )}
        <label
          className="block tracking-widest text-gray-300 text-sm font-bold mb-1"
          htmlFor="twitter"
        >
          Twitter
        </label>
        {twitterHandle ? (
          <p className="mb-5">@{twitterHandle}</p>
        ) : (
          <button
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight hover:bg-white hover:text-darkBlue mb-5 ${
              formError ? "border-red-500" : ""
            }`}
            onClick={onLinkTwitter}
          >
            Link Twitter
          </button>
        )}
        <LinkLens formError={formError} lensHandle={lensHandle} />

        <div className="flex">
          <button
            className="bg-purple ml-auto hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5"
            onClick={nextStep}
          >
            Next <RightOutlined className="text-sm" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Step1;
