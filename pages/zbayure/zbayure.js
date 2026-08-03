const util = require('../../utils/util')
const { req } = require('../../utils/request')

const ASSET_BASE_URL = util.externalUrl

const TEAM_BASE = [
  { id: 'lucheng', name: '鹿城', pinyin: 'lucheng', score: 999 },
  { id: 'longwan', name: '龙湾', pinyin: 'longwan', score: 999 },
  { id: 'ouhai', name: '瓯海', pinyin: 'ouhai', score: 3000 },
  { id: 'dongtou', name: '洞头', pinyin: 'dongtou', score: 999 },
  { id: 'yueqing', name: '乐清', pinyin: 'yueqing', score: 999 },
  { id: 'ruian', name: '瑞安', pinyin: 'ruian', score: 999 },
  { id: 'yongjia', name: '永嘉', pinyin: 'yongjia', score: 9999 },
  { id: 'wencheng', name: '文成', pinyin: 'wencheng', score: 9999 },
  { id: 'pingyang', name: '平阳', pinyin: 'pingyang', score: 9999 },
  { id: 'taishun', name: '泰顺', pinyin: 'taishun', score: 999 },
  { id: 'cangnan', name: '苍南', pinyin: 'cangnan', score: 999 },
  { id: 'longgang', name: '龙港', pinyin: 'longgang', score: 999 }
]

const TEAM_PINYIN_MAP = {
  鹿城: 'lucheng',
  龙湾: 'longwan',
  瓯海: 'ouhai',
  洞头: 'dongtou',
  乐清: 'yueqing',
  瑞安: 'ruian',
  永嘉: 'yongjia',
  文成: 'wencheng',
  平阳: 'pingyang',
  泰顺: 'taishun',
  苍南: 'cangnan',
  龙港: 'longgang'
}

const TEAM_LOGO_NO_MAP = {
  lucheng: '01',
  longwan: '02',
  ouhai: '03',
  dongtou: '04',
  yueqing: '05',
  ruian: '06',
  yongjia: '07',
  wencheng: '08',
  pingyang: '09',
  taishun: '10',
  cangnan: '11',
  longgang: '12'
}

const SUPPORT_POPULARITY_STEP = 10

const MEDAL_LEVELS = [
  { score: 10000, image: 'zbayure-medal-gold.png' },
  { score: 5000, image: 'zbayure-medal-silver.png' },
  { score: 3000, image: 'zbayure-medal-bronze.png' }
]

const HEALTH_TABS = [
  { key: 'plastic', name: '整形' },
  { key: 'dental', name: '口腔' },
  { key: 'checkup', name: '体检' },
  { key: 'rehab', name: '康复' }
]

const HEALTH_STYPE_MAP = {
  plastic: 68,
  dental: 62,
  checkup: 60,
  rehab: 69
}

const HEALTH_GOODS = {
  plastic: [
    {
      id: 'plastic-01',
      title: '无针水光',
      value: '价值168',
      desc: '医用面膜/唇/腋冰点脱毛单次（2选1）',
      points: 50
    },
    {
      id: 'plastic-02',
      title: '无针水光',
      value: '价值168',
      desc: '医用面膜/唇/腋冰点脱毛单次（2选1）',
      points: 50
    }
  ],
  dental: [
    {
      id: 'dental-01',
      title: '洁牙护理',
      value: '价值198',
      desc: '口腔洁牙/抛光护理单次',
      points: 60
    },
    {
      id: 'dental-02',
      title: '口腔检查',
      value: '价值99',
      desc: '基础口腔检查套餐',
      points: 30
    }
  ],
  checkup: [
    {
      id: 'checkup-01',
      title: '碳13检测',
      value: '价值220',
      desc: '幽门螺旋杆菌呼气检测',
      points: 80
    },
    {
      id: 'checkup-02',
      title: '运动体检',
      value: '价值299',
      desc: '运动健康基础评估套餐',
      points: 120
    }
  ],
  rehab: [
    {
      id: 'rehab-01',
      title: '高压氧舱',
      value: '价值398',
      desc: '高压氧舱体验单次',
      points: 160
    },
    {
      id: 'rehab-02',
      title: '肩颈放松',
      value: '价值168',
      desc: '康复理疗体验单次',
      points: 50
    }
  ]
}

function asset(path) {
  return `${ASSET_BASE_URL}/${path}`
}

function pickValue(obj, keys, defaultValue) {
  for (let i = 0; i < keys.length; i += 1) {
    if (obj && obj[keys[i]] !== undefined && obj[keys[i]] !== null) {
      return obj[keys[i]]
    }
  }

  return defaultValue
}

function toNumber(value, defaultValue) {
  const number = Number(value)
  return Number.isNaN(number) ? defaultValue : number
}

function formatAmount(value, defaultValue) {
  const number = Number(value)
  if (Number.isNaN(number)) {
    return defaultValue || '0'
  }
  return String(Number(number.toFixed(2)))
}

function isApiSuccess(data) {
  return !!data && data.status !== false && data.code !== 14007
}

function formatTeamName(name) {
  return String(name || '').replace(/\s/g, '').replace(/队$/, '')
}

function normalizePic(pic) {
  const value = String(pic || '')

  if (!value) {
    return ''
  }

  if (/^(https?:)?\/\//.test(value) || /^data:image\//.test(value)) {
    return value
  }

  if (value.indexOf('/') === 0) {
    return util.baseUrl + value
  }

  return asset(value)
}

function unwrapTeamList(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data
  }

  if (payload && payload.data && Array.isArray(payload.data.list)) {
    return payload.data.list
  }

  if (payload && Array.isArray(payload.Data)) {
    return payload.Data
  }

  return []
}

function unwrapProductList(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data
  }

  if (payload && payload.data && Array.isArray(payload.data.list)) {
    return payload.data.list
  }

  if (payload && payload.data && Array.isArray(payload.data.records)) {
    return payload.data.records
  }

  if (payload && Array.isArray(payload.Data)) {
    return payload.Data
  }

  if (payload && Array.isArray(payload.list)) {
    return payload.list
  }

  if (payload && Array.isArray(payload.records)) {
    return payload.records
  }

  return []
}

function normalizeProduct(item, index) {
  const id = pickValue(item, ['id', 'Id', 'goodsId', 'GoodsId'], `goods-${index}`)
  const title = pickValue(item, ['pictitle', 'PicTitle', 'title', 'Title', 'name', 'Name', 'goodsName', 'GoodsName'], '积分好礼')
  const price = pickValue(item, ['price', 'Price', 'value', 'Value'], '')
  const points = pickValue(item, ['pointsDeduction', 'PointsDeduction', 'paypoint', 'PayPoint', 'points', 'Points'], 0)
  const summary = pickValue(item, ['summary', 'Summary', 'desc', 'Desc', 'description', 'Description'], '')
  const image = normalizeProductImage(pickValue(item, ['picurl', 'PicUrl', 'pic', 'Pic', 'image', 'Image', 'logo', 'Logo'], ''))
  const priceNumber = toNumber(price, 0)
  const ptype = toNumber(pickValue(item, ['ptype', 'Ptype', 'pType', 'PType'], 0), 0)
  const spes = pickValue(item, ['spes', 'Spes', 'selSpec', 'SelSpec', 'spec', 'Spec', 'specName', 'SpecName'], '')

  return {
    id,
    title,
    value: price === '' || price === null ? '' : `价值${formatAmount(price)}`,
    desc: summary || title,
    points: formatAmount(points),
    price: priceNumber,
    priceText: priceNumber > 0 ? formatAmount(priceNumber) : '',
    ptype,
    spes,
    image,
    isApiProduct: true,
    raw: item
  }
}

function normalizeProducts(payload) {
  return unwrapProductList(payload).map(normalizeProduct).filter(item => item.id)
}

function normalizeProductImage(picurl) {
  const value = String(picurl || '').trim()

  if (!value) {
    return ''
  }

  if (/^(https?:)?\/\//.test(value) || /^data:image\//.test(value)) {
    return value
  }

  if (value.indexOf('/') === 0) {
    return util.baseUrl + value
  }

  return `${util.imgBaseUrl}${value}`
}

function getStoredRealInfo() {
  const userInfo = wx.getStorageSync('userInfo') || {}
  const realInfo = wx.getStorageSync('realInfo') || {}
  return Object.assign({}, userInfo, realInfo)
}

function getUserName(info) {
  return info.realname || info.name || info.nickName || info.nickname || ''
}

function getUserMobile(info) {
  return info.mobile || info.phone || info.tel || ''
}

function getPayParams(payload) {
  const data = payload && payload.data ? payload.data : payload

  if (!data || typeof data !== 'object') {
    return null
  }

  return {
    timeStamp: String(data.timeStamp || data.TimeStamp || ''),
    nonceStr: data.nonceStr || data.NonceStr || '',
    package: data.package || data.Package || '',
    signType: data.signType || data.SignType || 'MD5',
    paySign: data.paySign || data.PaySign || ''
  }
}

function normalizeTeam(item, index) {
  const rawName = pickValue(item, ['Name', 'name', 'TeamName', 'teamName'], '')
  const name = formatTeamName(rawName)
  const fallback = TEAM_BASE[index] || TEAM_BASE[0]
  const pinyin = TEAM_PINYIN_MAP[name] || fallback.pinyin

  return {
    id: pinyin,
    apiId: pickValue(item, ['Id', 'id', 'TeamId', 'teamId'], ''),
    name: name || fallback.name,
    pinyin,
    score: toNumber(pickValue(item, ['Popularity', 'popularity', 'Popular', 'popular'], fallback.score), fallback.score),
    sort: toNumber(pickValue(item, ['Sort', 'sort'], index + 1), index + 1),
    pic: normalizePic(pickValue(item, ['Pic', 'pic', 'Logo', 'logo'], ''))
  }
}

function normalizeTeams(payload) {
  return unwrapTeamList(payload)
    .map(normalizeTeam)
    .filter(item => item.name && item.pinyin)
    .sort((a, b) => a.sort - b.sort)
}

function teamLogo(type, pinyin) {
  const prefix = type === 'guess' ? 'guess-team' : 'support-team'
  const no = TEAM_LOGO_NO_MAP[pinyin] || '01'
  return asset(`${prefix}-${no}-${pinyin}.png`)
}

function teamMedal(score) {
  const value = toNumber(score, 0)
  const medal = MEDAL_LEVELS.find(item => value >= item.score)
  return medal ? asset(medal.image) : ''
}

function buildTeams(type, selectedId, sourceTeams) {
  const selectedIds = Array.isArray(selectedId) ? selectedId : [selectedId]
  const source = sourceTeams && sourceTeams.length ? sourceTeams : TEAM_BASE

  return source.map(team => {
    const score = team.score

    return Object.assign({}, team, {
      score,
      logo: team.pic || teamLogo(type, team.pinyin),
      medal: type === 'support' ? teamMedal(score) : '',
      selected: selectedIds.indexOf(team.id) > -1
    })
  })
}

function unwrapData(payload) {
  if (payload && payload.data !== undefined) {
    return payload.data
  }
  if (payload && payload.Data !== undefined) {
    return payload.Data
  }
  return payload
}

function unwrapGuessRecord(payload) {
  const data = unwrapData(payload)

  if (Array.isArray(data)) {
    if (data.length === 2 && data.every(item => item && typeof item === 'object')) {
      return {
        teams: data
      }
    }
    return data[0] || {}
  }

  if (data && Array.isArray(data.list)) {
    return data.list[0] || {}
  }
  if (data && Array.isArray(data.List)) {
    return data.List[0] || {}
  }
  if (data && Array.isArray(data.records)) {
    return data.records[0] || {}
  }
  if (data && Array.isArray(data.rows)) {
    return data.rows[0] || {}
  }
  if (data && data.data) {
    return unwrapGuessRecord(data)
  }

  return data || {}
}

function findTeamByValue(sourceTeams, value) {
  const text = String(value || '').trim()
  const name = formatTeamName(text)

  if (!text) {
    return null
  }

  return (sourceTeams || TEAM_BASE).find(team => (
    String(team.apiId || '') === text ||
    String(team.id || '') === text ||
    String(team.pinyin || '') === text ||
    formatTeamName(team.name) === name
  )) || null
}

function buildGuessModalTeam(value, sourceTeams, index) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  if (typeof value !== 'object') {
    const matched = findTeamByValue(sourceTeams, value)
    return matched ? {
      id: matched.id,
      name: matched.name,
      logo: matched.pic || teamLogo('guess', matched.pinyin)
    } : null
  }

  const idValue = pickValue(value, ['TeamId', 'teamId', 'Id', 'id', 'teamID'], '')
  const nameValue = pickValue(value, ['TeamName', 'teamName', 'Name', 'name', 'team'], '')
  const matched = findTeamByValue(sourceTeams, idValue) || findTeamByValue(sourceTeams, nameValue)
  const rawName = formatTeamName(nameValue)
  const pinyin = matched ? matched.pinyin : TEAM_PINYIN_MAP[rawName]
  const pic = normalizePic(pickValue(value, ['Pic', 'pic', 'Logo', 'logo', 'Image', 'image'], ''))

  if (matched) {
    return {
      id: matched.id,
      name: matched.name,
      logo: matched.pic || teamLogo('guess', matched.pinyin)
    }
  }

  if (!rawName && !pic) {
    return null
  }

  return {
    id: pinyin || `guess-${index}`,
    name: rawName || '竞猜队伍',
    logo: pic || teamLogo('guess', pinyin || TEAM_BASE[index % TEAM_BASE.length].pinyin)
  }
}

function normalizeMyGuessTeams(payload, sourceTeams) {
  const record = unwrapGuessRecord(payload)
  const values = []

  if (Array.isArray(record.teams)) {
    record.teams.forEach(item => values.push(item))
  }
  if (Array.isArray(record.Teams)) {
    record.Teams.forEach(item => values.push(item))
  }
  if (Array.isArray(record.teamIds)) {
    record.teamIds.forEach(item => values.push(item))
  }
  if (Array.isArray(record.TeamIds)) {
    record.TeamIds.forEach(item => values.push(item))
  }

  const championTeam = pickValue(record, ['ChampionTeam', 'championTeam', 'FirstTeam', 'firstTeam'], null)
  const runnerUpTeam = pickValue(record, ['RunnerUpTeam', 'runnerUpTeam', 'SecondTeam', 'secondTeam'], null)
  if (championTeam) values.push(championTeam)
  if (runnerUpTeam) values.push(runnerUpTeam)

  const championId = pickValue(record, ['ChampionTeamId', 'championTeamId', 'ChampionId', 'championId', 'FirstTeamId', 'firstTeamId'], '')
  const runnerUpId = pickValue(record, ['RunnerUpTeamId', 'runnerUpTeamId', 'RunnerId', 'runnerId', 'SecondTeamId', 'secondTeamId'], '')
  if (championId) values.push(championId)
  if (runnerUpId) values.push(runnerUpId)

  const championName = pickValue(record, ['ChampionTeamName', 'championTeamName', 'ChampionName', 'championName', 'FirstTeamName', 'firstTeamName'], '')
  const runnerUpName = pickValue(record, ['RunnerUpTeamName', 'runnerUpTeamName', 'RunnerName', 'runnerName', 'SecondTeamName', 'secondTeamName'], '')
  if (championName) values.push({ TeamName: championName })
  if (runnerUpName) values.push({ TeamName: runnerUpName })

  const seen = {}
  return values
    .map((item, index) => buildGuessModalTeam(item, sourceTeams, index))
    .filter(item => {
      if (!item || seen[item.id]) {
        return false
      }
      seen[item.id] = true
      return true
    })
    .slice(0, 2)
}

function increaseTeamScore(sourceTeams, id) {
  return (sourceTeams || []).map(team => {
    if (team.id !== id) {
      return team
    }

    return Object.assign({}, team, {
      score: toNumber(team.score, 0) + SUPPORT_POPULARITY_STEP
    })
  })
}

Page({
  data: {
    isRulePage: false,
    heroImage: asset('zbayure-hero.png'),
    supportGuessTitle: asset('zbayure-title-support-guess.png'),
    healthExchangeTitle: asset('zbayure-title-health-exchange.png'),
    floatButtons: [
      { type: 'rules', icon: asset('zbayure-float-rules.png') },
      { type: 'points', icon: asset('zbayure-float-points.png') },
      { type: 'guess', icon: asset('zbayure-float-guess.png') }
    ],
    playTabs: [
      { type: 'support', text: '助力战队得积分', activeImage: asset('zbayure-tab-support-active.png') },
      { type: 'guess', text: '精准预测大上分', activeImage: asset('zbayure-tab-guess-active.png') }
    ],
    currentPlayTab: 'support',
    teamValueLabel: '人气值',
    teamButtonText: '为TA助威',
    selectedSupportTeamId: '',
    selectedGuessTeamIds: [],
    guessSubmitted: false,
    guessLoading: false,
    supportLoading: false,
    myGuessLoading: false,
    showMyGuessModal: false,
    myGuessTeams: [],
    goodsLoading: false,
    goodsCache: {},
    teamSource: TEAM_BASE,
    teams: buildTeams('support', ''),
    guessTeams: buildTeams('guess', []),
    healthTabs: HEALTH_TABS,
    currentHealthTab: 'plastic',
    exchangeItems: []
  },

  onLoad(options) {
    const isRulePage = !!(options && options.page === 'rules')

    this.setData({
      isRulePage
    })
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&')
      if (arr.length < 2) arr = options.scene.split('%26')
      wx.setStorageSync('sponsor', arr[0])
    }
    if (isRulePage) {
      wx.setNavigationBarTitle({
        title: '活动规则'
      })
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#d8ecff'
      })
      return
    }

    this.loadTeams()
    this.loadExchangeItems(this.data.currentHealthTab)
  },

  loadTeams() {
    req({
      url: util.baseUrl + '/newapi/api/zjba/getteams',
      method: 'GET',
      success: res => {
        const teamSource = normalizeTeams(res.data)

        if (!teamSource.length) {
          return
        }

        this.setData({
          teamSource,
          teams: buildTeams('support', this.data.selectedSupportTeamId, teamSource),
          guessTeams: buildTeams('guess', this.data.selectedGuessTeamIds, teamSource)
        })
      },
      fail: () => {
        wx.showToast({
          title: '县队数据获取失败',
          icon: 'none'
        })
      }
    })
  },

  switchPlayTab(e) {
    const type = e.currentTarget.dataset.type

    if (!type || type === this.data.currentPlayTab) {
      return
    }

    const selectedId = type === 'guess' ? this.data.selectedGuessTeamIds : this.data.selectedSupportTeamId

    const data = {
      currentPlayTab: type,
      teamValueLabel: type === 'guess' ? '竞猜热度' : '人气值',
      teamButtonText: type === 'guess' ? '为TA竞猜' : '为TA助威'
    }

    if (type === 'guess') {
      data.guessTeams = buildTeams('guess', selectedId, this.data.teamSource)
    } else {
      data.teams = buildTeams('support', selectedId, this.data.teamSource)
    }

    this.setData(data)
  },

  toggleGuessTeam(e) {
    if (this.data.guessSubmitted || this.data.guessLoading) {
      wx.showToast({
        title: this.data.guessLoading ? '正在提交' : '竞猜已提交',
        icon: 'none'
      })
      return
    }

    const id = String(e.currentTarget.dataset.id)
    const selected = this.data.selectedGuessTeamIds.slice()
    const index = selected.indexOf(id)

    if (index > -1) {
      selected.splice(index, 1)
    } else if (selected.length >= 2) {
      wx.showToast({
        title: '最多选择2支',
        icon: 'none'
      })
      return
    } else {
      selected.push(id)
    }

    this.setData({
      selectedGuessTeamIds: selected,
      guessTeams: buildTeams('guess', selected, this.data.teamSource)
    })
  },

  handleGuessSubmit() {
    if (this.data.guessSubmitted || this.data.guessLoading) {
      wx.showToast({
        title: this.data.guessLoading ? '正在提交' : '竞猜已提交',
        icon: 'none'
      })
      return
    }

    if (this.data.selectedGuessTeamIds.length !== 2) {
      wx.showToast({
        title: '请选择2支战队',
        icon: 'none'
      })
      return
    }

    const openid = wx.getStorageSync('openid')
    const champion = this.data.teamSource.find(item => item.id === this.data.selectedGuessTeamIds[0])
    const runnerUp = this.data.teamSource.find(item => item.id === this.data.selectedGuessTeamIds[1])

    if (!openid) {
      wx.showToast({
        title: '请先登录后竞猜',
        icon: 'none'
      })
      return
    }

    if (!champion || !runnerUp || !champion.apiId || !runnerUp.apiId) {
      wx.showToast({
        title: '县队数据加载中',
        icon: 'none'
      })
      this.loadTeams()
      return
    }

    this.setData({
      guessLoading: true
    })

    req({
      url: util.baseUrl + '/newapi/api/zjba/guess',
      method: 'POST',
      data: {
        openid,
        championTeamId: champion.apiId,
        runnerUpTeamId: runnerUp.apiId
      },
      success: res => {
        const data = res.data || {}

        if (!isApiSuccess(data)) {
          wx.showToast({
            title: data.msg || '竞猜提交失败',
            icon: 'none'
          })
          return
        }

        this.setData({
          guessSubmitted: true
        })

        wx.showToast({
          title: '竞猜已提交',
          icon: 'success'
        })
      },
      fail: () => {
        wx.showToast({
          title: '竞猜提交失败',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({
          guessLoading: false
        })
      }
    })
  },

  handleTeamAction(e) {
    const id = String(e.currentTarget.dataset.id)
    const team = this.data.teams.find(item => item.id === id)

    if (!team || this.data.supportLoading) {
      return
    }

    wx.showModal({
      title: '确认助威',
      content: `确定为${team.name}战队助威吗？`,
      confirmText: '确认助威',
      cancelText: '再看看',
      success: res => {
        if (!res.confirm) {
          return
        }

        this.submitSupport(team)
      }
    })
  },

  submitSupport(team) {
    const teamId = team.apiId
    const openid = wx.getStorageSync('openid')

    if (!teamId) {
      wx.showToast({
        title: '县队数据加载中',
        icon: 'none'
      })
      this.loadTeams()
      return
    }

    if (!openid) {
      wx.showToast({
        title: '请先登录后助威',
        icon: 'none'
      })
      return
    }

    this.setData({
      supportLoading: true
    })

    req({
      url: util.baseUrl + '/newapi/api/zjba/support',
      method: 'POST',
      data: {
        openid,
        teamId
      },
      success: res => {
        const data = res.data || {}

        if (!isApiSuccess(data)) {
          wx.showToast({
            title: data.msg || '助威失败',
            icon: 'none'
          })
          return
        }

        const teamSource = increaseTeamScore(this.data.teamSource, team.id)

        this.setData({
          selectedSupportTeamId: team.id,
          teamSource,
          teams: buildTeams('support', team.id, teamSource),
          guessTeams: buildTeams('guess', this.data.selectedGuessTeamIds, teamSource)
        })

        wx.showToast({
          title: `已为${team.name}助威`,
          icon: 'none'
        })
        this.loadTeams()
      },
      fail: () => {
        wx.showToast({
          title: '助威失败，请稍后再试',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({
          supportLoading: false
        })
      }
    })
  },

  switchHealthTab(e) {
    const key = e.currentTarget.dataset.key

    if (!key || key === this.data.currentHealthTab) {
      return
    }

    this.setData({
      currentHealthTab: key
    })
    this.loadExchangeItems(key)
  },

  loadExchangeItems(key) {
    const cached = this.data.goodsCache[key]
    const stype = HEALTH_STYPE_MAP[key]

    if (cached) {
      this.setData({
        exchangeItems: cached.length ? cached : (HEALTH_GOODS[key] || [])
      })
      return
    }

    this.setData({
      goodsLoading: true,
      exchangeItems: []
    })

    req({
      url: util.baseUrl + '/newapi/api/goods/pintuanpagelist',
      method: 'POST',
      data: {
        stype,
        curpage: 1,
        limit: 10000,
        searchkey: '',
        sort: 0
      },
      success: res => {
        const list = normalizeProducts(res.data)
        const goodsCache = Object.assign({}, this.data.goodsCache, {
          [key]: list
        })

        this.setData({
          goodsCache,
          exchangeItems: list.length ? list : (HEALTH_GOODS[key] || [])
        })
      },
      fail: () => {
        this.setData({
          exchangeItems: HEALTH_GOODS[key] || []
        })
        wx.showToast({
          title: '商品加载失败',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({
          goodsLoading: false
        })
      }
    })
  },

  handleRedeem(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.exchangeItems.find(gift => String(gift.id) === String(id))

    if (item && item.isApiProduct) {
      this.confirmRedeemProduct(item)
      return
    }

    wx.showToast({
      title: item ? `${item.title}待开放` : '兑换待开放',
      icon: 'none'
    })
  },

  confirmRedeemProduct(item) {
    const openId = wx.getStorageSync('openid')

    if (!openId) {
      wx.showToast({
        title: '请先登录后购买',
        icon: 'none'
      })
      return
    }

    const productTitle = item.desc || item.title
    const costText = item.priceText ? `${item.points}积分+¥${item.priceText}` : `${item.points}积分`

    wx.showModal({
      title: '确认购买',
      content: `确定购买${productTitle}（${costText}）吗？`,
      confirmText: '确认购买',
      cancelText: '再看看',
      success: res => {
        if (res.confirm) {
          this.prepayRedeemProduct(item, openId)
        }
      }
    })
  },

  prepayRedeemProduct(item, openId) {
    const proid = toNumber(item.id, 0)

    if (!proid) {
      wx.showToast({
        title: '商品信息异常',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '校验中'
    })

    req({
      url: util.baseUrl + '/newapi/api/zjba/prepaygoods',
      method: 'POST',
      data: {
        orderTitle: item.desc || item.title,
        openId,
        ptype: item.ptype || 0,
        proid
      },
      success: res => {
        const data = res.data || {}

        if (!isApiSuccess(data)) {
          wx.hideLoading()
          wx.showModal({
            title: '购买失败',
            content: data.msg || '积分不足或暂不能购买',
            showCancel: false
          })
          return
        }

        wx.hideLoading()
        this.submitRedeemOrder(item, openId, proid)
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '购买校验失败',
          icon: 'none'
        })
      }
    })
  },

  submitRedeemOrder(item, openId, proid) {
    const price = toNumber(item.price, 0)
    const userInfo = getStoredRealInfo()
    const orderTitle = item.desc || item.title

    wx.showLoading({
      title: price > 0 ? '发起支付' : '兑换中'
    })

    req({
      url: util.baseUrl + '/newapi/api/qkh/prepacketpay',
      method: 'POST',
      data: {
        orderTitle,
        summary: '浙BA积分购买',
        OutTradeNo: String(+new Date()),
        TotalFee: price,
        openId,
        Source: '浙BA积分购买',
        xinmin: getUserName(userInfo),
        mobile: getUserMobile(userInfo),
        ptype: item.ptype || 0,
        proid,
        spes: item.spes || ''
      },
      success: res => {
        const data = res.data || {}

        if (!isApiSuccess(data)) {
          wx.hideLoading()
          wx.showModal({
            title: '购买失败',
            content: data.msg || '购买失败',
            showCancel: false
          })
          return
        }

        if (price <= 0) {
          wx.hideLoading()
          this.handleRedeemPaySuccess(data, '兑换成功')
          return
        }

        const payParams = getPayParams(data)

        if (!payParams || !payParams.timeStamp || !payParams.nonceStr || !payParams.package || !payParams.paySign) {
          wx.hideLoading()
          wx.showModal({
            title: '支付失败',
            content: data.msg || '支付参数异常',
            showCancel: false
          })
          return
        }

        wx.hideLoading()
        wx.requestPayment({
          ...payParams,
          success: payRes => {
            if (payRes.errMsg === 'requestPayment:ok') {
              this.handleRedeemPaySuccess(data, '支付成功')
            }
          },
          fail: payErr => {
            wx.showToast({
              title: payErr && payErr.errMsg === 'requestPayment:fail cancel' ? '已取消支付' : '支付失败',
              icon: 'none'
            })
          }
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '购买失败',
          icon: 'none'
        })
      }
    })
  },

  handleRedeemPaySuccess(data, title) {
    wx.showToast({
      title,
      icon: 'success'
    })

    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/kaquan/kaquan'
      })
    }, 800)
  },

  handleFloatTap(e) {
    const type = e.currentTarget.dataset.type

    if (type === 'rules') {
      wx.navigateTo({
        url: '/huodongpage/zbayure/zbayure?page=rules'
      })
      return
    }

    if (type === 'guess') {
      this.openMyGuessModal()
      return
    }

    if (type === 'points') {
      wx.navigateTo({
        url: '/huodongpage/zbayurepoints/zbayurepoints'
      })
      return
    }

    wx.showToast({
      title: '我的积分待开放',
      icon: 'none'
    })
  },

  openMyGuessModal() {
    this.setData({
      showMyGuessModal: true,
      myGuessLoading: true,
      myGuessTeams: []
    })
    this.loadMyGuess()
  },

  closeMyGuessModal() {
    this.setData({
      showMyGuessModal: false
    })
  },

  noop() {},

  loadMyGuess() {
    const openid = wx.getStorageSync('openid')

    if (!openid) {
      this.setData({
        myGuessLoading: false
      })
      wx.showToast({
        title: '请先登录后查看',
        icon: 'none'
      })
      return
    }

    req({
      url: util.baseUrl + '/newapi/api/zjba/myguess',
      method: 'POST',
      data: {
        openid,
        page: 0,
        limit: 0
      },
      success: res => {
        const data = res.data || {}

        if (!isApiSuccess(data)) {
          wx.showToast({
            title: data.msg || '我的竞猜获取失败',
            icon: 'none'
          })
          return
        }

        this.setData({
          myGuessTeams: normalizeMyGuessTeams(data, this.data.teamSource)
        })
      },
      fail: () => {
        wx.showToast({
          title: '我的竞猜获取失败',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({
          myGuessLoading: false
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: "参与战队竞猜/助力赢积分兑医用面膜/冰点脱毛/洁牙/CT等健康美好礼……",
      imageUrl: "https://wx.pmc-wz.com/materials/zbaftx.jpg",
      path: '/huodongpage/zbayure/zbayure?fromid=' + wx.getStorageSync('openid'),
    }
  },
  onShareTimeline(){
    return {
      title: "参与战队竞猜/助力赢积分兑医用面膜/冰点脱毛/洁牙/CT等健康美好礼……",
      imageUrl: "https://wx.pmc-wz.com/materials/zbaftx.jpg",
      path: '/huodongpage/zbayure/zbayure?fromid=' + wx.getStorageSync('openid'),
    }
  },
})
