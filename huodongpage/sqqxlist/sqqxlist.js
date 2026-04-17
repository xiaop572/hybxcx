// huodongpage/sqqxlist/sqqxlist.js
const { req } = require('../../utils/request')
const { baseUrl } = require('../../utils/util')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    showRoleModal: false,
    selectedRole: '',
    currentAuditId: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getList();
  },

  /**
   * 获取申请列表
   */
  getList() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    wx.showLoading({ title: '加载中' });

    req({
      url: baseUrl + '/newapi/api/subt/getaccesslist',
      method: 'POST',
      data: {
        // 不用传参
      },
      success: (res) => {
        wx.hideLoading();
        this.setData({ loading: false });
        console.log('获取列表返回:', res.data);

        if (res.data && res.data.status) {
          const rawList = res.data.data || []; 
          const listData = Array.isArray(rawList) ? rawList : (rawList.list || []);

          const formattedList = listData.map(item => {
            // 格式化时间，去掉T
            let formatTime = item.addtime || '';
            if (formatTime) {
              formatTime = formatTime.replace('T', ' ');
            }

            // 字段映射适配
            // classname -> 姓名
            // posx -> 状态 (0:待审核 1:已通过 2:已拒绝)
            // posy -> 权限类型 (1:院长 2:中高层领导)
            // addtime -> 时间
            
            const status = item.posx || 0;
            let statusText = this.getStatusText(status);
            
            // 如果已通过，显示权限类型
            if (status === 1 && item.posy) {
              const roleMap = { 1: '院长', 2: '中高层领导' };
              const roleName = roleMap[item.posy] || '';
              if (roleName) {
                statusText += ` (${roleName})`;
              }
            }

            return {
              id: item.id,
              name: item.classname || '未知用户', 
              createTime: formatTime,
              status: status, 
              statusText: statusText,
              statusClass: this.getStatusClass(status),
              role: item.posy,
              ...item 
            };
          });
          
          this.setData({
            list: formattedList,
            hasMore: false 
          });
        } else {
          wx.showToast({
            title: res.data?.msg || '获取失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({ loading: false });
        console.error('获取列表失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  getStatusText(status) {
    // posx: 0-待审核, 1-已通过, 2-已拒绝
    const map = { 0: '待审核', 1: '已通过', 2: '已拒绝' };
    return map[status] || '未知状态';
  },

  getStatusClass(status) {
    const map = { 0: 'status-pending', 1: 'status-approved', 2: 'status-rejected' };
    return map[status] || '';
  },

  /**
   * 处理审核按钮点击
   */
  handleAudit(e) {
    const { id, action } = e.currentTarget.dataset;
    console.log('点击审核:', id, action);

    if (action === 'approve') {
      this.setData({
        showRoleModal: true,
        currentAuditId: id,
        selectedRole: '' // 重置选择
      });
    } else {
      // 拒绝操作
      wx.showModal({
        title: '提示',
        content: '确定要拒绝该申请吗？',
        success: (res) => {
          if (res.confirm) {
            this.submitAudit(id, 'reject');
          }
        }
      });
    }
  },

  /**
   * 关闭弹窗
   */
  closeModal() {
    this.setData({
      showRoleModal: false,
      currentAuditId: null,
      selectedRole: ''
    });
  },

  /**
   * 选择权限角色
   */
  selectRole(e) {
    const { role } = e.currentTarget.dataset;
    this.setData({
      selectedRole: role
    });
  },

  /**
   * 确认审核通过
   */
  confirmAudit() {
    if (!this.data.selectedRole) {
      wx.showToast({
        title: '请选择权限类型',
        icon: 'none'
      });
      return;
    }

    this.submitAudit(this.data.currentAuditId, 'approve', this.data.selectedRole);
  },

  /**
   * 提交审核结果
   */
  submitAudit(id, action, role = null) {
    console.log('提交审核:', id, action, role);
    
    if (action === 'approve') {
      wx.showLoading({ title: '处理中...' });

      // 权限类型转换: dean->1, manager->2
      const priv = role === 'dean' ? 1 : 2;

      req({
        url: baseUrl + '/newapi/api/subt/auditaccess',
        method: 'POST',
        data: {
          id: id,
          priv: priv
        },
        success: (res) => {
          wx.hideLoading();
          if (res.data && res.data.status) {
            wx.showToast({
              title: '已通过',
              icon: 'success'
            });
            this.closeModal();
            // 刷新列表
            this.getList();
          } else {
            wx.showToast({
              title: res.data?.msg || '操作失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('审核失败:', err);
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
        }
      });
    } else {
      // 拒绝操作 - 暂时提示未对接
      wx.showToast({
        title: '拒绝接口暂未配置',
        icon: 'none'
      });
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.setData({ list: [], page: 1, hasMore: true });
    this.getList();
    wx.stopPullDownRefresh();
  }
})