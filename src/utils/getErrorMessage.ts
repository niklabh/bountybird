// Copyright 2019-2025 @polka-labs/townhall authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StatusCodes } from 'http-status-codes';

const getErrorMessage = (error: any, otherMessage?: string): string => {
	if (typeof error === 'string') {
		return error;
	} else if (typeof error === 'object') {
		if (error?.reason) {
			return error.reason;
		}
		if (error?.message) {
			return error.message;
		}
	}
	return otherMessage || 'Something went wrong.';
};

export const getErrorStatus = (error: any, otherStatusCode?: number): number => {
	if (error && error.name && !isNaN(Number(error.name))) {
		return Number(error.name);
	}
	return otherStatusCode || StatusCodes.INTERNAL_SERVER_ERROR;
};

export default getErrorMessage;