import { sendMessage as bridgeSendMessage } from "webext-bridge/content-script"

const NO_SW_ERROR_PATTERN =
	/(no sw|could not establish connection|receiving end does not exist|extension context invalidated)/i
const FIRE_AND_FORGET_METHODS = new Set(["increaseBadge", "setBadgeText", "resetBadge", "updateUrl"])

function isNoServiceWorkerError(error: unknown) {
	const message = error instanceof Error ? error.message : String(error)
	return NO_SW_ERROR_PATTERN.test(message)
}

function runtimeSendMessage<T = unknown>(type: string, data?: unknown) {
	return new Promise<T>((resolve, reject) => {
		try {
			chrome.runtime.sendMessage({ type, data }, (response) => {
				const runtimeError = chrome.runtime.lastError
				if (runtimeError) reject(new Error(runtimeError.message))
				else resolve(response as T)
			})
		} catch (error) {
			reject(error)
		}
	})
}

export async function sendMessage<T = unknown>(type: string, data?: unknown, destination?: string) {
	try {
		return (await bridgeSendMessage(type as never, data as never, destination as never)) as T
	} catch (bridgeError) {
		const useRuntimeFallback = destination === "background" && isNoServiceWorkerError(bridgeError)
		if (!useRuntimeFallback) throw bridgeError
		try {
			return await runtimeSendMessage<T>(type, data)
		} catch (runtimeError) {
			if (FIRE_AND_FORGET_METHODS.has(type) && isNoServiceWorkerError(runtimeError)) {
				console.debug("Background message dropped (No SW)", { type })
				return undefined as T
			}
			throw runtimeError
		}
	}
}
