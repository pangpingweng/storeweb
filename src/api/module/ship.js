import request from '@/utils/request'

// 查询运输列表
export function listShip(query) {
  return request({
    url: '/module/ship/list',
    method: 'get',
    params: query
  })
}
export function listWuliu(query) {
  return request({
    url: '/module/ship/listWuliu',
    method: 'get',
    params: query
  })
}
// 查询运输详细
export function getShip(shipId) {
  return request({
    url: '/module/ship/' + shipId,
    method: 'get'
  })
}

// 新增运输
export function addShip(data) {
  return request({
    url: '/module/ship',
    method: 'post',
    data: data
  })
}

// 修改运输
export function updateShip(data) {
  return request({
    url: '/module/ship',
    method: 'put',
    data: data
  })
}

// 删除运输
export function delShip(shipId) {
  return request({
    url: '/module/ship/' + shipId,
    method: 'delete'
  })
}

  export function getdriverList(query) {
    return request({
      url: '/module/driver/allList',
      method: 'get',
      params: query
    })
  }
  export function getcarList(query) {
    return request({
      url: '/module/car/allList',
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

