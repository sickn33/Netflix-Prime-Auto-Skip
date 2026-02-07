const AMAZON_BLOCKED_FILTER_PATHS = /(\/detail\/|\/watch|\/player\/|\/gp\/video\/detail|\/auth\/)/i

export function shouldRunAmazonPaidFilter(url: string) {
	if (!url) return false
	try {
		const parsed = new URL(url, window.location.origin)
		return !AMAZON_BLOCKED_FILTER_PATHS.test(parsed.pathname)
	} catch {
		return !AMAZON_BLOCKED_FILTER_PATHS.test(url)
	}
}

export function isStoreIconTitle(title: string | null | undefined) {
	// Match "Store" icon labels but avoid broad matches like "storefront".
	return /(^|[^a-z])store([^a-z]|$)/i.test(title ?? "")
}

export function isPaidEntitlementText(label: string | null | undefined) {
	// Includes common Prime storefront paid labels across languages.
	// Intentionally avoids broad "store" and "paid" terms to prevent false positives on hover cards.
	return /(rent|buy|purchase|nolegg|acquist|louer|acheter|kaufen|leihen|alquila|alugar)/i.test(label ?? "")
}

export function shouldRemoveWholePaidSection(visibleCardsCount: number, paidCardsCount: number, bannerOffset = 2) {
	if (visibleCardsCount <= 0 || paidCardsCount <= 0) return false
	return visibleCardsCount - bannerOffset <= paidCardsCount
}
