import { NextApiHandler } from 'next';
import messages from '../utils/messages';

type TWithErrorHandling = (handler: NextApiHandler) => NextApiHandler;

const withErrorHandling: TWithErrorHandling = (handler) => {
	return async (req, res) => {
		// CORS preflight request
		if (req.method === 'OPTIONS') return res.status(200).end();

		try {
			await handler(req, res);
		} catch (error: any) {
			// console log needed for logging on server
			console.log('Error in API : ', error);
			return res.status(Number(error.name) || 500).json({
				...error,
				message: error.message || messages.API_FETCH_ERROR
			});
		}
	};
};

export default withErrorHandling;
