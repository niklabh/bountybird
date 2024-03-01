// Copyright 2019-2025 @polka-labs/townhall authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import getErrorMessage from '@/src/utils/getErrorMessage';
import messages from '@/src/utils/messages';
import { getAccessToken } from '@privy-io/react-auth';

type TParams = {
	[key: string]: any;
};

type TApiResponse<T> = {
	data?: T;
	error?: string;
	status?: number;
};

export const paramsKeyConvert = (str = '') => str.replace(/[A-Z]/g, ([s]) => `_${s.toLowerCase()}`);

class Townhall {
	private uri: string;

	constructor(uri?: string) {
		if (uri) {
			this.uri = uri;
		} else {
			this.uri = process.env.NEXT_PUBLIC_TOWNHALL_URL || '';
		}
	}

	async fetch<T>(path: string, params: TParams, options?: RequestInit) {
		const url = new URL(path, this.uri + '/api/');
		for (const key of Object.keys(params)) {
			url.searchParams.set(paramsKeyConvert(key), params[key]);
		}
		const token = await getAccessToken();
		options = {
			...options,
			headers: {
				...options?.headers,
				Authorization: (token ? `Bearer ${token}` : ''),
				'x-token-type': 'privy'
			}
		};
		return new Promise<TApiResponse<T>>((resolve) => {
			const customResolve = (params: {
				data: T | undefined;
				error: string | undefined;
				status: number;
			}) => {
				resolve(params);
			};
			fetch(url, options)
				.then((resp) => {
					resp.json().then((res) => {
						if (resp.status === 200) {
							return customResolve({
								data: res as T,
								error: undefined,
								status: resp.status
							});
						} else {
							return customResolve({
								data: undefined,
								error: res.error || res.message || messages.API_FETCH_ERROR,
								status: resp.status || res.name
							});
						}
					}).catch((e) => {
						return customResolve({
							data: undefined,
							error: getErrorMessage(e) || 'Something went wrong, unable to decode response.',
							status: e?.status || e?.name || 500
						});
					});
				})
				.catch((e) =>
					customResolve({
						data: undefined,
						error: getErrorMessage(e),
						status: 500
					})
				);
		});
	}

	/** T means response type, B means body type */
	async post<T, B>(path: string, body?: B, options?: RequestInit) {
		const result = await this.fetch<T>(
			path,
			{},
			{
				body: body? JSON.stringify(body): null,
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'POST',
				...options
			}
		);
		return result;
	}

	/** T means response type, Q means query type */
	async get<T, Q>(path: string, params: TParams & Q, options?: RequestInit) {
		const result = await this.fetch<T>(
			path,
			params,
			{
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'GET',
				...options
			}
		);
		return result;
	}
}

export default Townhall;