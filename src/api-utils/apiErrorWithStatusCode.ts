export default function apiErrorWithStatusCode(message: string, code: number) {
	const error: Error = new Error(message);
	error.name = code.toString();
	return error;
}