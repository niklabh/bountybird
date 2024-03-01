import { NextApiRequest } from 'next';
import apiErrorWithStatusCode from './apiErrorWithStatusCode';

/**
 * Get Token from request
 */
export default function getTokenFromReq(req: NextApiRequest): string {
	// Authorization header is of format:
	// Authorization: Bearer $asdnkjadj32j23kj@#adslkads
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		throw apiErrorWithStatusCode('Authorization header missing', 400);
	}

	const token = `${authHeader}`.split(' ')[1];

	if (!token) {
		throw apiErrorWithStatusCode('Token missing', 400);
	}

	return token;
}
