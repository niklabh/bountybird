import { profileActions } from '@/src/redux/profile';
import { usePrivy } from '@privy-io/react-auth';
import React, { FC, useEffect } from 'react'
import { useDispatch } from 'react-redux';
import Login from './Login';
import { useProfileSelector } from '@/src/redux/selectors';
import Loader from './Loader';
import Profile from './Profile';

interface IAuthWrapperProps {
	logout: () => void;
	login: () => void;
}

const AuthWrapper: FC<IAuthWrapperProps> = (props) => {
	const { login, logout } = props;
	const { ready, authenticated, user: privyUser } = usePrivy();
	const { privy_loading, user } = useProfileSelector();
	const dispatch = useDispatch();

	useEffect(() => {
		if (ready) {
			if (authenticated) {
				if (!user?.privy_user) {
					dispatch(profileActions.setPrivyUser(JSON.parse(JSON.stringify(privyUser))));
				}
			} else {
				if (user) {
					dispatch(profileActions.setUser(null));
				}
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [privyUser, user, authenticated, ready]);

	if (!ready || privy_loading) {
		return <Loader />;
	}

	if (authenticated) {
		return <Profile logout={logout} privyUser={privyUser} user={user} />;
	}

	return <Login login={login} />;
}

export default AuthWrapper