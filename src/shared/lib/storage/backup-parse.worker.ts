import type { PushlogBackupPayload } from "./backup-parse";
import { parsePushlogBackup } from "./backup-parse";

type RequestMessage = { raw: string };
type ResponseMessage = { ok: true; payload: PushlogBackupPayload } | { ok: false; error: string };

self.onmessage = (event: MessageEvent<RequestMessage>) => {
	try {
		const payload = parsePushlogBackup(event.data.raw);
		const response: ResponseMessage = { ok: true, payload };
		self.postMessage(response);
	} catch (error) {
		const response: ResponseMessage = {
			ok: false,
			error: error instanceof Error ? error.message : String(error),
		};
		self.postMessage(response);
	}
};
