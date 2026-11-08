import type { Dict } from './en';

export const zh: Dict = {
	menu: {
		menu: '菜单',
		language: '语言',
		blender: '配气',
		preferences: '设置',
		about: '关于'
	},
	section: {
		collapse: '收起{title}',
		gases: '可用气体',
		gasesSummary: '已用 {used}/{total}',
		target: '目标混合气',
		mix: '配气步骤',
		mixSummary: '{mix}，充至 {pressure}'
	},
	gases: {
		hint: '勾选配气时可以使用的气体。每种气体的压力决定了不用增压泵时它最多能充到多少。',
		use: '使用{name}',
		name: '名称',
		pressure: '压力',
		remove: '删除',
		removeGas: '删除{name}',
		invalid: 'O2 与 He 合计须为 0 至 100 %，压力须为 0 或以上。',
		none: '尚未登记气体。',
		add: '添加气体'
	},
	target: {
		mix: '类型',
		depth: '目标深度',
		optional: '可选',
		ppo2Max: 'PPO2 上限',
		needsDepth: '需要深度',
		density: '气体密度',
		endO2: 'END 将 O2 计为麻醉性气体（设置）。',
		endN2: 'END 仅将 N2 计为麻醉性气体（设置）。',
		densityAtDepth: '{depth} 处的气体密度：',
		densityAtMod: 'MOD（{mod}）处的气体密度：',
		recommended: '建议 ≤ {density}，至 {depth}；',
		maximum: '最大 {density}，在 {depth}。'
	},
	problem: {
		o2: 'O2 须大于 0 % 且不超过 100 %。',
		he: 'He 须为 0 % 至小于 100 %。',
		sum: 'O2 与 He 合计超过 100 %。',
		ppo2: 'PPO2 上限须大于 0。',
		'depth-beyond-mod': '目标深度超过了该混合气的 MOD。',
		hypoxic: '低氧混合气：在水面不可呼吸。',
		'density-recommended': '目标深度的气体密度超过建议值 5.2 g/l。可考虑增加氦气。',
		'density-maximum': '目标深度的气体密度超过 6.2 g/l 的绝对上限。请加氦气，或计划更浅的潜水。'
	},
	mix: {
		cylinderNow: '当前气瓶',
		pressure: '压力',
		volume: '容积',
		currently: '当前为 {mix}。容积：气瓶的水容积。',
		target: '目标',
		targetPressure: '目标压力',
		mix: '混合气',
		density: '密度',
		gasWhenFull: '充满后气量',
		atDepth: '分压与密度为目标深度（{depth}）处的值。充满后气量：1 bar、15 °C 下的自由气体体积。',
		atMod: '分压与密度为 MOD 处的值。充满后气量：1 bar、15 °C 下的自由气体体积。',
		compensated: '温度补偿',
		fillTemperature: '充气时的气瓶温度',
		compensatedHint: '以下压力为该温度下的读数；气瓶回到 15 °C 时即达到目标压力。',
		o2From: 'O2 来源',
		heFrom: 'He 来源',
		topWith: '补充气体',
		noGas: '没有在用的气体',
		setCylinder: '将气瓶设为 {pressure}',
		checkTarget: '请先检查目标混合气。',
		analyse: '使用前请用分析仪检测最终混合气。',
		now: '当前',
		empty: '空'
	},
	error: {
		target: '请检查目标混合气。',
		targetPressure: '请检查目标压力。',
		volume: '请检查气瓶容积。',
		start: '请检查气瓶中的混合气。',
		startPressure: '请检查气瓶中的压力。',
		temperature: '请检查温度。',
		missingO2: '没有可用于配气的 O2：请在“可用气体”中勾选一种。',
		missingHe: '没有可用于配气的 He：请在“可用气体”中勾选一种。',
		missingTop: '没有可用于补充的气体：请在“可用气体”中勾选一种。',
		impossible: '用所选气体无法配出该混合气，即使从空瓶开始也不行。',
		excessO2: '气瓶中的 O2 对该混合气来说过多。',
		excessHe: '气瓶中的 He 对该混合气来说过多。',
		excessPressure: '气瓶已高于目标压力。',
		problemThen: '{problem}{todo}',
		drain: '请先放气至 {pressure}。',
		empty: '请先将其放空。',
		sourceO2: 'O2 气源（{available}）低于此步骤所需的 {needed}：请使用更满的气源或增压泵。',
		sourceHe: 'He 气源（{available}）低于此步骤所需的 {needed}：请使用更满的气源或增压泵。',
		sourceTop: '补充气体（{available}）低于此步骤所需的 {needed}：请使用更满的气源或增压泵。',
		outsideFit: '超出真实气体数据的范围（高于 350 bar，或低于 −10 °C、高于 60 °C）：结果精度较低。'
	},
	preferences: {
		title: '设置',
		temperature: '温度',
		pressure: '压力',
		volume: '容积',
		depth: '深度',
		model: '气体模型',
		real: '真实气体（压缩因子来自 NIST 数据）',
		ideal: '理想气体（经典分压法）',
		o2Narcotic: 'O2 有麻醉性（N2 + O2）',
		n2Only: '仅 N2',
		saved: '保存在本设备上。深度按每 bar 10 m 海水，或每 atm 33 ft 计算。'
	},
	about: {
		title: '关于',
		intro:
			'Trimix Blender 计算空气、高氧（Nitrox）和三混气（Trimix）的分压配气：向气瓶中依次加入多少 O2、He 和补充气体。',
		native: '完全在您的设备上运行，不使用网络；不会发送任何数据。',
		web: '完全在您的浏览器中运行，加载后可离线使用；不会发送任何数据。',
		danger: '配气有危险：氧气起火、混合气错误。只有受过培训才可配气，潜水前务必分析最终混合气。',
		version: '版本 {version}',
		built: '构建于 {date}',
		source: 'GitHub 上的源代码',
		docker: 'Docker Hub 上的 Docker 镜像',
		license: '采用 GNU GPL v3 许可',
		how: '计算方法',
		howDalton: '分压、MOD 和 END：道尔顿定律，每 bar 10 m 海水（每 atm 33 ft）。',
		howMoles:
			'配气按摩尔逐种气体（O2、He 和 N2）求解，因此对真实气体同样成立。压力表读数换算为绝对压力；空瓶中仍有 1 atm 的气体。',
		howReal:
			'真实气体：每种气体的压缩因子 Z 拟合自 NIST 参考数据（−10 至 +60 °C，最高 350 bar）；混合气的 Z 遵循阿马加定律。拟合精度：{accuracy}。',
		howTemperature: '温度补偿：目标压力为 15 °C 时的压力（气瓶额定压力的基准）；显示的压力为充气温度下的读数。',
		howSource: '每个公式及其出处都在 {file} 中。',
		references: '参考文献'
	},
	update: {
		available: '应用有新版本可用。',
		reload: '重新加载',
		later: '稍后'
	}
};
