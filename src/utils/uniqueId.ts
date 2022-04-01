// 拷贝自 loadsh util中，类似工具在underscore中也有定义
const idCounter: Record<string, number> = {}

export function uniqueId(prefix = 'util$'): string {
	if (!idCounter[prefix]) {
		idCounter[prefix] = 0
	}

	const id = ++idCounter[prefix]

	return prefix === 'util$' ? `${id}` : `${prefix}${id}`
}
