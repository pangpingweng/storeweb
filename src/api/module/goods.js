import request from '@/utils/request'

// 查询货物列表
export function listGoods(query) {
  return request({
    url: '/module/goods/list',
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
// 查询货物详细
export function getGoods(goodsId) {
  return request({
    url: '/module/goods/' + goodsId,
    method: 'get'
  })
}

// 新增货物
export function addGoods(data) {
  return request({
    url: '/module/goods',
    method: 'post',
    data: data
  })
}

// 修改货物
export function updateGoods(data) {
  return request({
    url: '/module/goods',
    method: 'put',
    data: data
  })
}

// 删除货物
export function delGoods(goodsId) {
  return request({
    url: '/module/goods/' + goodsId,
    method: 'delete'
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
      url: '/module/supplier/allList',
      method: 'get',
      params: query
    })
  }
  export function getgtypeList(query) {
    return request({
      url: '/module/gtype/allList',
      method: 'get',
      params: query
    })
  }

