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

const HEALTH_TABS = [
  { key: 'plastic', name: '整形' },
  { key: 'dental', name: '口腔' },
  { key: 'checkup', name: '体检' },
  { key: 'rehab', name: '康复' }
]

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

function buildTeams(type, selectedId, sourceTeams) {
  const selectedIds = Array.isArray(selectedId) ? selectedId : [selectedId]
  const source = sourceTeams && sourceTeams.length ? sourceTeams : TEAM_BASE

  return source.map(team => Object.assign({}, team, {
    logo: team.pic || teamLogo(type, team.pinyin),
    selected: selectedIds.indexOf(team.id) > -1
  }))
}

function increaseTeamScore(sourceTeams, id) {
  return (sourceTeams || []).map(team => {
    if (team.id !== id) {
      return team
    }

    return Object.assign({}, team, {
      score: toNumber(team.score, 0) + 1
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
    teamSource: TEAM_BASE,
    teams: buildTeams('support', ''),
    guessTeams: buildTeams('guess', []),
    healthTabs: HEALTH_TABS,
    currentHealthTab: 'plastic',
    exchangeItems: HEALTH_GOODS.plastic
  },

  onLoad(options) {
    const isRulePage = !!(options && options.page === 'rules')

    this.setData({
      isRulePage
    })

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
      currentHealthTab: key,
      exchangeItems: HEALTH_GOODS[key] || []
    })
  },

  handleRedeem(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.exchangeItems.find(gift => gift.id === id)

    wx.showToast({
      title: item ? `${item.title}待开放` : '兑换待开放',
      icon: 'none'
    })
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
      this.setData({
        currentPlayTab: 'guess',
        teamValueLabel: '竞猜热度',
        teamButtonText: '为TA竞猜',
        guessTeams: buildTeams('guess', this.data.selectedGuessTeamIds, this.data.teamSource)
      })
      return
    }

    wx.showToast({
      title: '我的积分待开放',
      icon: 'none'
    })
  },

  onShareAppMessage() {
    if (this.data.isRulePage) {
      return {
        title: '浙BA助威活动规则',
        path: '/huodongpage/zbayure/zbayure?page=rules'
      }
    }

    return {
      title: '为浙BA助威 为健康美加油',
      path: '/huodongpage/zbayure/zbayure',
      imageUrl: this.data.heroImage
    }
  },

  onShareTimeline() {
    if (this.data.isRulePage) {
      return {
        title: '浙BA助威活动规则'
      }
    }

    return {
      title: '为浙BA助威 为健康美加油',
      imageUrl: this.data.heroImage
    }
  }
})
