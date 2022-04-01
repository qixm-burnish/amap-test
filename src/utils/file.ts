type TargetContext = '_self' | '_blank'

export function openWindow(
	url: string,
	opt?: { target?: TargetContext | string; noopener?: boolean; noreferrer?: boolean }
) {
	const { target = '__blank', noopener = true, noreferrer = true } = opt || {}
	const feature: string[] = []

	noopener && feature.push('noopener=yes')
	noreferrer && feature.push('noreferrer=yes')

	window.open(url, target, feature.join(','))
}

/**
 * Download file according to file address
 * @param {*} sUrl
 */
export function downloadByUrl({
	url,
	target = '_self',
	fileName
}: {
	url: string
	target?: TargetContext
	fileName?: string
}): boolean {
	const isChrome = window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1
	const isSafari = window.navigator.userAgent.toLowerCase().indexOf('safari') > -1

	if (/(iP)/g.test(window.navigator.userAgent)) {
		return false
	}
	if (isChrome || isSafari) {
		const link = document.createElement('a')
		link.href = url
		link.target = target

		if (link.download !== undefined) {
			link.download = fileName || url.substring(url.lastIndexOf('/') + 1, url.length)
		}

		if (document.createEvent) {
			const e = document.createEvent('MouseEvents')
			e.initEvent('click', true, true)
			link.dispatchEvent(e)
			return true
		}
	}
	if (url.indexOf('?') === -1) {
		url += '?download'
	}

	openWindow(url, { target })
	return true
}
