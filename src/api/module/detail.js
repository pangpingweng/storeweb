import request from '@/utils/request'

// 查询出入库明细列表
export function listDetail(query) {
  return request({
    url: '/module/detail/list',
    method: 'get',
    params: query
  })
}
export function listDay(query) {
  return request({
    url: '/module/detail/dayList',
    method: 'get',
    params: query
  })
}
export function listWeek(query) {
  return request({
    url: '/module/detail/weekList',
    method: 'get',
    params: query
  })
}
export function listMonth(query) {
  return request({
    url: '/module/detail/monthList',
    method: 'get',
    params: query
  })
}

// 查询出入库明细详细
export function getDetail(detailId) {
  return request({
    url: '/module/detail/' + detailId,
    method: 'get'
  })
}

// 新增出入库明细
export function addDetail(data) {
  return request({
    url: '/module/detail',
    method: 'post',
    data: data
  })
}

// 修改出入库明细
export function updateDetail(data) {
  return request({
    url: '/module/detail',
    method: 'put',
    data: data
  })
}

// 删除出入库明细
export function delDetail(detailId) {
  return request({
    url: '/module/detail/' + detailId,
    method: 'delete'
  })
}

  export function getgoodsList(query) {
    return request({
      url: '/module/goods/allList',
      method: 'get',
      params: query
    })
  }

export function getstoreList(query) {
  return request({
    url: '/module/store/allList',
    method: 'get',
    params: query
  })
}
export function getuserList(query) {
  return request({
    url: '/system/user/allList',
    method: 'get',
    params: query
  })
}
export function getsupplierList(query) {
  return request({
    url: '/module/supplier/allList',
    method: 'get',
    params: query
  })
}

export function getareaList(query) {
  return request({
    url: '/module/area/allList',
    method: 'get',
    params: query
  })
}

  export function getstockList(query) {
    return request({
      url: '/module/stock/allList',
      method: 'get',
      params: query
    })
  }
export function gettypeList(query) {
  return request({
    url: '/module/gtype/allList',
    method: 'get',
    params: query
  })
}

