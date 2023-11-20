import request from '@/utils/request'

// 查询出入库列表
export function listStock(query) {
  return request({
    url: '/module/stock/list',
    method: 'get',
    params: query
  })
}

// 查询出入库详细
export function getStock(stockId) {
  return request({
    url: '/module/stock/' + stockId,
    method: 'get'
  })
}

// 新增出入库
export function addStock(data) {
  return request({
    url: '/module/stock',
    method: 'post',
    data: data
  })
}

// 修改出入库
export function updateStock(data) {
  return request({
    url: '/module/stock',
    method: 'put',
    data: data
  })
}

// 删除出入库
export function delStock(stockId) {
  return request({
    url: '/module/stock/' + stockId,
    method: 'delete'
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

  export function getstoreList(query) {
    return request({
      url: '/module/store/allList',
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
export function getareaList(query) {
  return request({
    url: '/module/area/allList',
    method: 'get',
    params: query
  })
}
