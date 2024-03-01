import React, { useEffect, useState } from "react";
import { NotificationStatus, IUser } from "@/src/types";
import nextApiClientFetch from "@/src/utils/nextApiClientFetch";
import LoadingState from "@/src/components/ui-components/LoadingState";
import { usePrivy } from "@privy-io/react-auth";
import Step1 from "@/src/components/create-profile/Step1";
import Step2 from "@/src/components/create-profile/Step2";
import queueNotification from "@/src/components/ui-components/QueueNotification";
import Image from "next/image";
import useMediaQuery from "@/src/hooks/useMediaQuery";
import { useRouter } from "next/router";
import SEOHead from "@/src/global/SEOHead";
import editProfile from "@/src/utils/editProfile";
import { useProfileSelector } from "@/src/redux/selectors";
import { useDispatch } from "react-redux";
import { profileActions } from "@/src/redux/profile";
import getErrorMessage from "@/src/utils/getErrorMessage";

const CreateProfile = () => {
  const [step, setStep] = useState(1);
  const { user: privyUser, ready, authenticated } = usePrivy();
  const { user, loading } = useProfileSelector();
  const dispatch = useDispatch();

  const router = useRouter();

  const isMobile = useMediaQuery("(max-width: 640px)");

  const updateProfile = async () => {
    if (!user?.name) {
      queueNotification({
        header: "Error!",
        message: 'Display name is required',
        status: NotificationStatus.ERROR,
      });
      return;
    }
    if (!user?.username) {
      queueNotification({
        header: "Error!",
        message: 'Username is required',
        status: NotificationStatus.ERROR,
      });
      return;
    }
    if (!user?.bio) {
      queueNotification({
        header: "Error!",
        message: 'Bio is required',
        status: NotificationStatus.ERROR,
      });
      return;
    }

    dispatch(profileActions.setLoading(true));
    try {
      const { data, error: fetchError } = await editProfile<IUser>({
        name: user?.name,
        username: user?.username,
        bio: user?.bio,
      });
  
      if (fetchError || !data) {
        queueNotification({
          header: "Error updating profile",
          message: fetchError,
          status: NotificationStatus.ERROR,
        });
        dispatch(profileActions.setLoading(false));
      } else {
        dispatch(profileActions.setUser(data));
        queueNotification({
          header: "Success!",
          message: "Profile updated successfully",
          status: NotificationStatus.SUCCESS,
        });
        dispatch(profileActions.setLoading(false));
        router.push(`/profile/${data.username}`);
      }
    } catch (error) {
      queueNotification({
        header: "Error!",
        message: getErrorMessage(error),
        status: NotificationStatus.SUCCESS,
      });  
      dispatch(profileActions.setLoading(false));
    }
  };

  return (
    <>
      <SEOHead
        title={'Bounty Bird | Powered By Townhall'}
        desc={'Link your X and Hey.xyz handles to create a profile on Bounty Bird! Connect and discover their bounty achievements. Join the community and tag @TheBountyBird to share your own bounties!'}
      />
      {
        (loading || !ready)?
          <LoadingState />
        : authenticated? (
            <div className="flex gap-5 flex-col md:flex-row">
              <div className="flex-1 relative mt-10 items-center justify-center">
                {isMobile ? (
                  <Image
                    src="/assets/bounty-bird-mobile.png"
                    alt="logo"
                    width={280}
                    height={90}
                  />
                ) : (
                  <Image
                    src="/assets/bounty-bird.png"
                    alt="logo"
                    width={580}
                    height={510}
                  />
                )}
              </div>
              <div className="flex-1 flex flex-col">
                <h1 className="text-2xl font-semibold my-3 mx-auto">
                  Setup your Profile!
                </h1>
                <div className="p-6 w-full max-w-2xl mt-4 mx-auto bg-black border rounded-xl shadow-md flex items-center space-x-4">
                  <Step1
                    step={step}
                    setStep={setStep}
                    username={user?.username || ''}
                    displayName={user?.name || ''}
                    twitterHandle={privyUser?.twitter?.username || ''}
                    lensHandle={user?.lens_handle || ''}
                  />
                  <Step2
                    step={step}
                    setStep={setStep}
                    bio={user?.bio || ''}
                    submitForm={updateProfile}
                    isSubmitting={loading}
                    wallet={privyUser?.wallet?.address || ''}
                  />
                </div>
              </div>
            </div>
        ): (
          <div>
            <h1>Unauthorized</h1>
          </div>
        )
      }
    </>
  );
};

export default CreateProfile;
