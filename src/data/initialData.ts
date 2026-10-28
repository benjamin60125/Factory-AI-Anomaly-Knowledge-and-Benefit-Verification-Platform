/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Case, AISuggestion, HumanReview, KPISetting } from '../types';

export const INITIAL_CASES: Case[] = [
  {
    id: 'CASE-2026-001',
    date: '2026-03-12',
    line: 'SMT 高速貼片線 A',
    equipment: '10溫區迴焊爐 Reflow-02',
    anomalyType: '溫度異常',
    symptoms: '第4溫區實際測溫棒讀值偶發性跳動 ±14°C，出爐後 BGA 晶片腳位出現大量冷焊 (Cold Solder) 與錫珠殘留，AOI 檢出率驟降至 84%。',
    parameters: '預設溫度：215°C；傳送鏈速：0.85 m/min；N2 流量：18 m³/h；殘氧率：650 ppm',
    rootCause: '第4加熱模組熱電偶保護管內部積碳氧化，造成測溫訊號傳輸干擾與接觸熱阻增加，PID 控制器誤判而降溫，實際板面溫度不足。',
    actionSteps: '1. 暫停連線生產並鎖定進板通道。\n2. 拆卸第4區上加熱模組保護罩，以無塵酒精清潔熱電偶探棒。\n3. 使用高精度校正測溫儀與測溫板 (K-type M.O.L.E) 進行實時10點爐溫曲線驗證。\n4. 更換老化 K-type 感溫線並重新鎖固螺帽至 2.5 N·m。\n5. 試跑兩片空白治具板，確認殘氧 < 800 ppm 且曲線符合 J-STD-020 標準後方得放行。',
    reasoning: '傳統觀念常直接加大第4區加熱功率，但師傅依據「冷焊集中於單一板側且溫度數值跳動無規律」，直接斷定為熱電偶回授雜訊而非電熱管損壞，避免整組加熱棒報廢更換。',
    resolutionResult: '爐溫曲線恢復在 ±1.5°C 管制線內，AOI 檢測良率回升至 99.6%，無二次返修。',
    downtimeMinutes: 45,
    scrapCost: 12500,
    troubleshootingHours: 0.75,
    recordedBy: '陳建宏 (資深SMT主任工)',
    keywords: ['迴焊爐', '冷焊', '熱電偶', '爐溫曲線', 'BGA', 'SMT'],
    reviewStatus: '已覆核',
    createdAt: '2026-03-12T09:40:00Z',
    updatedAt: '2026-03-12T14:20:00Z',
  },
  {
    id: 'CASE-2026-002',
    date: '2026-03-18',
    line: '精密加工二廠',
    equipment: 'CNC 五軸立式銑床 VMC-500',
    anomalyType: '震動過大',
    symptoms: '加工航太鋁合金葉輪時，主軸轉速達 12,000 RPM 伴隨刺耳高頻金屬嘯叫聲，工件表面 Ra 值由 0.4μm 劣化至 1.8μm，出現週期性規則抖紋。',
    parameters: '主軸轉速：12,000 RPM；進給率：F=2200 mm/min；切深 ap：1.5 mm；冷卻壓力：25 bar',
    rootCause: '刀柄筒夾 (ER32) 內部夾持錐面微量積屑，導致刀具伸出長度 85mm 處之徑向跳動 (Runout) 累積達 18μm，超出安全極限引發共振再生顫振。',
    actionSteps: '1. 立即暫停程式執行，退刀至安全平面。\n2. 取下刀柄，使用千分錶檢測主軸內錐孔跳動（確認主軸軸承正常，跳動 < 2μm）。\n3. 拆解筒夾與螺帽，以專用錐度清潔棒清除內部微米級鋁屑，以紅丹粉檢查接觸面達 85% 以上。\n4. 換裝新鎢鋼四刃銑刀，將外伸長度由 85mm 縮短至剛性最佳之 62mm。\n5. 重新進行動平衡校正至 G2.5 等級，以慢速試切第一件確認表面粗糙度。',
    reasoning: '菜鳥技術員常懷疑是主軸軸承磨損欲申請大修，老技師用手指輕觸主軸箱體振動頻率與觀察抖紋間距，判定為「刀具動平衡與夾持跳動失衡引發的共振」，省下數十萬拆機檢修與停機三天風險。',
    resolutionResult: '更換夾持配置後切削表面光潔如鏡，Ra 值改善至 0.28μm，振動加速度值降回 0.8 mm/s。',
    downtimeMinutes: 50,
    scrapCost: 38000,
    troubleshootingHours: 1.0,
    recordedBy: '黃振榮 (模具五軸資深技工)',
    keywords: ['CNC', '五軸銑床', '抖紋', '切削共振', '主軸振動', '刀具跳動'],
    reviewStatus: '已覆核',
    createdAt: '2026-03-18T11:15:00Z',
    updatedAt: '2026-03-18T16:00:00Z',
  },
  {
    id: 'CASE-2026-003',
    date: '2026-04-02',
    line: '射出成型三線',
    equipment: '油電混合射出成型機 INJ-180',
    anomalyType: '壓力洩漏',
    symptoms: '生產透明光學鏡片保護蓋時，模具遠端澆口處出現短射 (Short Shot) 與縮水現象，保壓切換點延遲 0.8 秒，射出終點位置不穩定。',
    parameters: '料管各段溫度：230/245/255/250°C；射出峰壓：135 bar；保壓：85 bar；模溫：65°C',
    rootCause: '螺桿前端止逆環 (Check Ring) 與墊圈長期磨損間隙擴大至 0.35mm，高速射出時高溫熔融塑料發生逆流洩壓，實質有效射出壓力降低。',
    actionSteps: '1. 停止自動循環運轉，手動將料管內餘料完全射出清空。\n2. 執行熔融膠量靜態逆流保壓測試（螺桿推到底保持壓力，觀察螺桿是否有後退滑移），確認螺桿後退達 12mm。\n3. 將料管降溫後拆卸噴嘴頭與止逆三件組。\n4. 測量止逆環外徑與料管內壁配合間隙，確認已達報廢限度。\n5. 更換高耐磨雙金屬止逆組件，回裝後校正同軸度並重新設定射出背壓 8 bar。',
    reasoning: '現場助理常盲目調高射出壓力與料筒溫度試圖填飽模穴，但師傅指出「溫度已在降解邊緣且短射伴隨螺桿後退量異常」，直指止逆環磨損逆流，避免了原料焦化黑點與模具壓傷。',
    resolutionResult: '更換止逆三件組後，鏡片成型飽滿無縮水，產品重量誤差控制在 ±0.03g 內。',
    downtimeMinutes: 75,
    scrapCost: 19500,
    troubleshootingHours: 1.25,
    recordedBy: '林金水 (射出成型技術督導)',
    keywords: ['射出機', '短射', '止逆環', '逆流', '光學鏡片', '縮水'],
    reviewStatus: '已覆核',
    createdAt: '2026-04-02T13:30:00Z',
    updatedAt: '2026-04-02T17:45:00Z',
  },
  {
    id: 'CASE-2026-004',
    date: '2026-04-10',
    line: '半導體封裝線',
    equipment: '自動高速固晶機 (Die Bonder) DB-03',
    anomalyType: '真空不足',
    symptoms: '高速拾取 0.8mm×0.8mm 晶粒時，拾取良率下降至 91%，機台頻繁發出「Pick-up Vacuum Low」警報，並伴隨晶粒微裂與歪斜放置。',
    parameters: '真空供應源：-85 kPa；拾取延遲：12 ms；擺臂加速度：25G；膠量厚度：35 μm',
    rootCause: '晶粒吸嘴 (Collet) 內部 0.2mm 微孔遭散熱銀膠揮發沉積物微量堵塞，且吸嘴端面金剛石塗層輕微崩角，破壞負壓密封。',
    actionSteps: '1. 切換至手動工程模式，關閉晶圓進料台。\n2. 使用光學顯微鏡 100x 檢視吸嘴尖端形貌與排氣微孔。\n3. 拆下吸嘴置入超音波專用溶劑清洗槽震盪 8 分鐘。\n4. 檢查真空電磁閥與微型濾心，發現濾芯濾紙已呈深褐色，一併更換全新濾芯。\n5. 重新校準吸嘴與晶圓接觸之高度零點 (Z-height Touch Down)，確認真空感測值達到 -82 kPa 以下。',
    reasoning: '工程人員原本懷疑是廠務端真空幫浦管路洩漏，老技師先測量鄰近機台真空穩定，再用高倍放大鏡看到吸嘴尖端結晶，立刻判定為吸嘴端部微堵塞，節省全廠巡檢時間。',
    resolutionResult: '真空讀值恢復至 -86 kPa，拾取成功率達 99.98%，晶粒貼裝偏移角度 < 0.5度。',
    downtimeMinutes: 30,
    scrapCost: 45000,
    troubleshootingHours: 0.5,
    recordedBy: '蔡文斌 (封測製程主任)',
    keywords: ['固晶機', '吸嘴', '真空不足', '晶粒拾取', 'Die Bonder', '半導體'],
    reviewStatus: '已覆核',
    createdAt: '2026-04-10T08:20:00Z',
    updatedAt: '2026-04-10T11:00:00Z',
  },
  {
    id: 'CASE-2026-005',
    date: '2026-04-19',
    line: '廠務公用動力站',
    equipment: '變頻螺桿式空壓機 AC-02 (75kW)',
    anomalyType: '溫度異常',
    symptoms: '空壓機排氣溫度持續爬升至 106°C（超過 105°C 警報門檻），主機頻發高溫預警，排氣露點異常升高，後端氣壓不穩定。',
    parameters: '排氣壓力：7.2 bar；馬達電流：128 A；冷卻水進口水溫：28°C；出口水溫：31°C',
    rootCause: '冷卻水板式熱交換器水側水垢結垢嚴重，溫差僅 3°C（正常應達 8~10°C），熱交換效率大幅受阻；潤滑油劣化黏度上升。',
    actionSteps: '1. 將備援空壓機 AC-01 啟動併網，無縫切換供氣負荷。\n2. 卸載 AC-02 並執行冷卻運轉 10 分鐘後停機、掛牌斷電 (LOTO)。\n3. 拆開板式熱交換器冷卻水側管線，使用食品級檸檬酸清洗劑循環酸洗去垢 2 小時。\n4. 更換原廠全合成螺桿空壓機潤滑油與油細分離器 (Oil Separator) 濾芯。\n5. 重新開啟冷卻水逆洗並校正熱電偶測溫點，確認滿載排氣溫度降回 86°C。',
    reasoning: '傳統直覺以為是風扇或機油不足，師傅觀察「進出水溫差極小，代表熱量根本沒被冷卻水帶走」，準確鎖定熱交換器結垢，一次徹底解決問題。',
    resolutionResult: '滿載排氣溫度降至 84°C，冷卻水溫差擴大至 9.2°C，全廠氣壓穩定於 7.2±0.1 bar。',
    downtimeMinutes: 40,
    scrapCost: 6000,
    troubleshootingHours: 0.65,
    recordedBy: '張銘峰 (公用廠務高級工程師)',
    keywords: ['空壓機', '螺桿機', '高溫跳機', '熱交換器', '水垢', '廠務'],
    reviewStatus: '已覆核',
    createdAt: '2026-04-19T14:10:00Z',
    updatedAt: '2026-04-19T18:30:00Z',
  },
  {
    id: 'CASE-2026-006',
    date: '2026-05-03',
    line: '高速自動沖壓線',
    equipment: '300噸閉式單點精密沖床 P-300',
    anomalyType: '尺寸超差',
    symptoms: '連續沖壓薄板端子金屬件時，送料步距每沖次累計偏擺 0.08mm，導正銷 (Pilot Pin) 入孔受阻並壓傷料帶，成品連續 15 模尺寸超差。',
    parameters: '沖速：180 SPM；板厚：0.35 mm 磷青銅；料捲張力：4.5 kgf；送料步距：25.4 mm',
    rootCause: '數控伺服送料機之主動送滾輪表面防滑聚氨酯塗層局部微量脫膠，且光學編碼器同步皮帶鬆弛齒位跳動，導致高速加減速滑差。',
    actionSteps: '1. 立即觸發緊急停機保護模具，取出受損金屬料帶。\n2. 檢視連續模導正銷與切刃口有無碎裂（經確認模具無受損）。\n3. 檢驗送料滾輪圓跳動，發現左側受力壓痕磨損。\n4. 拆解伺服送料機護罩，測量同步皮帶張力（頻率檢測儀顯示僅 42Hz，標準需 65Hz）。\n5. 調緊皮帶張力滾輪，使用無水酒精徹底除油擦拭送料滾輪表面，以千分尺重新設定送料間隙為板厚 -0.02mm。\n6. 低速 30 SPM 試沖 5 模，投影量測步距公差落於 ±0.005mm 內後恢復量產。',
    reasoning: '新手常先拆模具磨刀口，資深模具師傅從「壓痕位置固定週期出現」判定是送料滾輪或同步皮帶滑移，直接在機台端調校，避免耗費 4 小時拆修精密級進模。',
    resolutionResult: '送料步距穩定度回到 ±0.003mm，連續生產 20,000 沖次無任何壓料刮傷。',
    downtimeMinutes: 60,
    scrapCost: 24000,
    troubleshootingHours: 1.1,
    recordedBy: '吳義雄 (級進模具總工程師)',
    keywords: ['沖壓', '送料機', '步距超差', '連續模', '導正銷', '伺服送料'],
    reviewStatus: '已覆核',
    createdAt: '2026-05-03T10:00:00Z',
    updatedAt: '2026-05-03T15:20:00Z',
  },
];

export const INITIAL_KPI_SETTINGS: KPISetting = {
  downtimeCostPerHour: 18000, // 停機每小時成本 NT$ 18,000
  averageHourlyLaborRate: 500, // 平均人工時薪 NT$ 500
  baselineTroubleshootingHours: 2.8, // 基準排查時間 (小時)
  improvedTroubleshootingHours: 0.8, // 改善後排查時間 (小時)
  baselineDowntimeHours: 3.2, // 基準停機時間 (小時)
  improvedDowntimeHours: 1.1, // 改善後停機時間 (小時)
  baselineScrapCost: 16000, // 基準報廢金額 (NT$)
  improvedScrapCost: 3500, // 改善後報廢金額 (NT$)
  annualOccurrences: 36, // 年度預計發生次數 (次)
  implementationCost: 150000, // 系統導入成本 (NT$ 150,000)
};

export const INITIAL_SUGGESTIONS: AISuggestion[] = [
  {
    id: 'SUGG-2026-001',
    timestamp: '2026-05-04T09:15:00Z',
    inputQuery: {
      line: 'SMT 高速貼片線 A',
      equipment: '迴焊爐 Reflow-02',
      symptoms: '第4溫區溫度波動異常，剛換線後測得焊點有微量虛焊',
      additionalNotes: '傳送鏈速正常，但控制面板顯示第4區加熱器偶爾有功率瞬間掉至零的現象',
    },
    similarCases: [
      {
        caseId: 'CASE-2026-001',
        similarity: 94,
        caseSource: 'SMT 高速貼片線 A / 迴焊爐 Reflow-02',
        possibleReason: '熱電偶保護管內部積碳氧化或測溫線接頭鬆動引起測溫回授訊號跳動',
        historicalAction: '清潔熱電偶探棒並更換老化感溫線，使用測溫板驗證10點爐溫曲線',
        cautions: '切勿直接調大加熱功率，需先確認殘氧量與實測板溫',
      },
    ],
    structuredResponse: {
      possibleReasons: [
        '研判可能原因一：第4區熱電偶測溫線老化或接點接觸不良，造成 PID 回授訊號失真。',
        '研判可能原因二：加熱棒固態繼電器 (SSR) 內部可控矽觸發異常或散熱不良觸發保護。',
      ],
      referencedCases: ['CASE-2026-001'],
      recommendedSteps: [
        '步驟1【安全確認】：按下機台維修待機按鈕，確認第4溫區保護蓋接地良好。',
        '步驟2【感溫線檢查】：比對 CASE-2026-001，量測第4溫區 K-type 熱電偶毫伏特輸出值是否穩定。',
        '步驟3【固態繼電器量測】：使用勾錶檢測第4加熱組三相電流是否平衡，排除單相斷線。',
        '步驟4【實板測溫】：上機測溫板跑過爐曲線，確認 BGA 焊接峰值溫度是否在 240~245°C 之間。',
      ],
      riskWarnings: [
        '【品質風險】未驗證爐溫前若強行送板，可能造成整批載板 BGA 虛焊，報廢成本每批達數萬元。',
        '【電氣安全】量測加熱器高壓端子時必須佩戴絕緣手套，並落實掛牌上鎖 (LOTO) 規範。',
      ],
      humanConfirmationRequired: [
        '需由 SMT 資深工程師親自覆核過爐溫度曲線圖 (Profile Chart)。',
        '首批試跑 3 片需全檢 AOI 並經品保工程師簽名放行。',
        '嚴禁由 AI 或自動化程式逕自覆寫 PID 參數。',
      ],
      insufficientData: false,
    },
    isModelGenerated: true,
    status: '已覆核',
    reviewId: 'REV-2026-001',
  },
  {
    id: 'SUGG-2026-002',
    timestamp: '2026-05-04T14:30:00Z',
    inputQuery: {
      line: '精密加工二廠',
      equipment: 'CNC 五軸銑床 VMC-500',
      symptoms: '高速切削時表面出現輕微條紋，主軸有些微異音',
      additionalNotes: '刀具剛換新，夾持伸長量約 80mm',
    },
    similarCases: [
      {
        caseId: 'CASE-2026-002',
        similarity: 91,
        caseSource: '精密加工二廠 / CNC 五軸銑床 VMC-500',
        possibleReason: '刀具伸出長度過長引發共振，或筒夾錐面微量積屑導致動平衡跳動',
        historicalAction: '縮短刀具外伸長度，清理 ER 筒夾內錐面微屑並校正動平衡至 G2.5',
        cautions: '切勿在未檢測跳動情況下直接判斷為主軸損壞大修',
      },
    ],
    structuredResponse: {
      possibleReasons: [
        '研判可能原因一：刀具外伸懸伸比 (L/D) 過大引發切削諧振再生抖紋。',
        '研判可能原因二：刀柄內錐面有微米級細屑，導致徑向跳動 (Runout) 超出 10μm。',
      ],
      referencedCases: ['CASE-2026-002'],
      recommendedSteps: [
        '步驟1【跳動量測】：使用千分錶架於主軸，量測刀具尖端跳動值，確認是否大於 5μm。',
        '步驟2【夾持縮短】：依據 CASE-2026-002 經驗，將刀具外伸量從 80mm 縮短至 65mm 以內。',
        '步驟3【筒夾清潔】：拆下筒夾以專用清洗液清除微金屬屑並檢查錐面貼合度。',
      ],
      riskWarnings: [
        '【模具風險】高頻顫振易導致鎢鋼刀具微崩刃，引發工件深層劃痕甚至報廢。',
        '【機台風險】長期共振可能損傷陶瓷主軸軸承預壓，導致主軸精度永久劣化。',
      ],
      humanConfirmationRequired: [
        '需由 CNC 領班或資深師傅以千分錶確認刀具徑向跳動在合格規範內。',
        '試切首件需經三次元量床 (CMM) 或粗糙度儀檢驗 Ra < 0.4μm 人工簽核。',
      ],
      insufficientData: false,
    },
    isModelGenerated: true,
    status: '待覆核',
  },
];

export const INITIAL_REVIEWS: HumanReview[] = [
  {
    id: 'REV-2026-001',
    suggestionId: 'SUGG-2026-001',
    querySummary: 'SMT 迴焊爐 Reflow-02 第4溫區波動與焊點虛焊',
    decision: '採用',
    finalDiagnosis: '同意 AI 研判之可能原因一。經三用電錶量測，確為熱電偶訊號接線端子因機台震動產生微阻抗變化，導致測溫偶發性漂移。',
    actualRemediation: '更換抗干擾屏蔽感溫導線，重新端子壓接並以高精度熱偶儀校驗，連續過板 5 片實測無任何虛焊。',
    decisionReason: 'AI 建議明確引用 CASE-2026-001，防範了不必要的加熱模組盲目拆換，檢查步驟具體且切合現場狀況。',
    reviewer: '陳建宏 (SMT 廠務主管)',
    safetyCertified: true,
    createdAt: '2026-05-04T10:10:00Z',
    isSavedToKnowledgeBase: true,
    newCaseId: 'CASE-2026-001',
  },
];
