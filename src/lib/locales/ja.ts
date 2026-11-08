import type { Dict } from './en';

export const ja: Dict = {
	menu: {
		menu: 'メニュー',
		language: '言語',
		blender: 'ブレンド',
		preferences: '設定',
		about: 'このアプリについて'
	},
	section: {
		collapse: '{title}を閉じる',
		gases: '使用可能なガス',
		gasesSummary: '{total}本中{used}本を使用',
		target: '目標ガス',
		mix: 'ブレンド手順',
		mixSummary: '{mix}、{pressure}まで'
	},
	gases: {
		hint: 'ブレンドに使ってよいガスにチェックを入れてください。ブースターなしで充填できる上限は、各ガスの圧力で決まります。',
		use: '{name}を使用',
		name: '名前',
		pressure: '圧力',
		remove: '削除',
		removeGas: '{name}を削除',
		invalid: 'O2とHeの合計は0〜100 %、圧力は0以上にしてください。',
		none: '登録されたガスはありません。',
		add: 'ガスを追加'
	},
	target: {
		mix: '種類',
		depth: '目標水深',
		optional: '任意',
		ppo2Max: 'PPO2上限',
		needsDepth: '水深が必要',
		density: 'ガス密度',
		endO2: 'ENDはO2も麻酔性として計算（設定）。',
		endN2: 'ENDはN2のみを麻酔性として計算（設定）。',
		densityAtDepth: '{depth}でのガス密度：',
		densityAtMod: 'MOD（{mod}）でのガス密度：',
		recommended: '推奨 ≤ {density}：{depth}まで。',
		maximum: '最大 {density}：{depth}。'
	},
	problem: {
		o2: 'O2は0 %より大きく100 %以下にしてください。',
		he: 'Heは0 %以上100 %未満にしてください。',
		sum: 'O2とHeの合計が100 %を超えています。',
		ppo2: 'PPO2上限は0より大きくしてください。',
		'depth-beyond-mod': '目標水深がこのガスのMODより深くなっています。',
		hypoxic: '低酸素ガス：水面では呼吸できません。',
		'density-recommended':
			'目標水深でのガス密度が推奨値の5.2 g/lを超えています。ヘリウムを増やすことを検討してください。',
		'density-maximum':
			'目標水深でのガス密度が絶対上限の6.2 g/lを超えています。ヘリウムを加えるか、より浅いダイビングを計画してください。'
	},
	mix: {
		cylinderNow: '現在のタンク',
		pressure: '圧力',
		volume: '容量',
		currently: '現在：{mix}。容量：タンクの内容積（水容量）。',
		target: '目標',
		targetPressure: '目標圧力',
		mix: 'ガス',
		density: '密度',
		gasWhenFull: '満充填時のガス量',
		atDepth: '分圧と密度は目標水深（{depth}）での値。満充填時のガス量：1 bar・15 °Cでの自由ガス体積。',
		atMod: '分圧と密度はMODでの値。満充填時のガス量：1 bar・15 °Cでの自由ガス体積。',
		compensated: '温度補正',
		fillTemperature: '充填中のタンク温度',
		compensatedHint: '以下の圧力はこの温度での読み値です。タンクが15 °Cに戻ったときに目標圧力になります。',
		o2From: 'O2の供給元',
		heFrom: 'Heの供給元',
		topWith: 'トップアップに使うガス',
		noGas: '使用中のガスなし',
		setCylinder: 'タンクを{pressure}にする',
		checkTarget: 'まず目標ガスを確認してください。',
		analyse: '使用前に最終ガスをアナライザーで確認してください。',
		now: '現在',
		empty: '空'
	},
	error: {
		target: '目標ガスを確認してください。',
		targetPressure: '目標圧力を確認してください。',
		volume: 'タンク容量を確認してください。',
		start: 'タンク内のガスを確認してください。',
		startPressure: 'タンク内の圧力を確認してください。',
		temperature: '温度を確認してください。',
		missingO2: 'ブレンドに使うO2がありません：「使用可能なガス」でチェックを入れてください。',
		missingHe: 'ブレンドに使うHeがありません：「使用可能なガス」でチェックを入れてください。',
		missingTop: 'トップアップ用のガスがありません：「使用可能なガス」でチェックを入れてください。',
		impossible: '選択したガスでは、空のタンクからでもこのガスは作れません。',
		excessO2: 'このガスにはタンク内のO2が多すぎます。',
		excessHe: 'このガスにはタンク内のHeが多すぎます。',
		excessPressure: 'タンクはすでに目標圧力を超えています。',
		problemThen: '{problem}{todo}',
		drain: 'まず{pressure}まで抜いてください。',
		empty: 'まず空にしてください。',
		sourceO2:
			'O2の供給元（{available}）がこの工程で必要な{needed}を下回っています：より圧力の高い供給元かブースターを使ってください。',
		sourceHe:
			'Heの供給元（{available}）がこの工程で必要な{needed}を下回っています：より圧力の高い供給元かブースターを使ってください。',
		sourceTop:
			'トップアップ用ガス（{available}）がこの工程で必要な{needed}を下回っています：より圧力の高い供給元かブースターを使ってください。',
		outsideFit: '実在気体データの範囲外です（350 bar超、−10 °C未満、または60 °C超）：結果の精度は下がります。'
	},
	preferences: {
		title: '設定',
		temperature: '温度',
		pressure: '圧力',
		volume: '容量',
		depth: '水深',
		model: 'ガスモデル',
		real: '実在気体（NISTデータによる圧縮係数）',
		ideal: '理想気体（従来の分圧法）',
		o2Narcotic: 'O2も麻酔性（N2 + O2）',
		n2Only: 'N2のみ',
		saved: 'この端末に保存されます。水深は1 barあたり海水10 m、または1 atmあたり33 ftで計算します。'
	},
	about: {
		title: 'このアプリについて',
		intro:
			'Trimix Blenderは、エア・ナイトロックス・トライミックスの分圧ブレンドを計算します。タンクにO2、次にHe、最後にトップアップ用ガスをどれだけ入れるかを示します。',
		native: 'すべて端末内で動作し、ネットワークは使いません。何も送信されません。',
		web: 'すべてブラウザ内で動作し、一度読み込めばオフラインで使えます。何も送信されません。',
		danger:
			'ガスブレンドは危険です（酸素火災、誤ったガス）。訓練を受けた場合にのみブレンドし、潜る前に必ず最終ガスを分析してください。',
		version: 'バージョン {version}',
		built: 'ビルド日：{date}',
		source: 'GitHubのソースコード',
		docker: 'Docker HubのDockerイメージ',
		license: 'GNU GPL v3ライセンス',
		how: '計算方法',
		howDalton: '分圧・MOD・END：ドルトンの法則。1 barあたり海水10 m（1 atmあたり33 ft）。',
		howMoles:
			'ブレンドは実在気体でも成り立つよう、ガスごと（O2、He、N2）にモル数で解いています。ゲージ圧は絶対圧に換算します。空のタンクにも1 atm分のガスが残っています。',
		howReal:
			'実在気体：各ガスの圧縮係数ZはNISTの基準データ（−10〜+60 °C、350 barまで）に当てはめています。混合ガスのZはアマガーの法則に従います。当てはめの精度：{accuracy}。',
		howTemperature:
			'温度補正：目標圧力は15 °Cでの圧力です（タンクの公称圧力の基準）。表示される圧力は充填時の温度での読み値です。',
		howSource: 'すべての計算式とその出典は{file}にあります。',
		references: '参考文献'
	},
	update: {
		available: 'アプリの新しいバージョンがあります。',
		reload: '再読み込み',
		later: '後で'
	}
};
