// Copyright 2019-2025 @polka-labs/townhall authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const convertFirestoreTimestampToDate = (timestamp: any) => {
	if (timestamp && timestamp.toDate && typeof timestamp.toDate === 'function') {
		return timestamp.toDate();
	}
	return timestamp;
};
export default convertFirestoreTimestampToDate;