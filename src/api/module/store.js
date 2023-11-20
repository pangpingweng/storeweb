import request from '@/utils/request'

// 查询仓库列表
export function listStore(query) {
  return request({
    url: '/module/store/list',
    method: 'get',
    params: query
  })
}

// 查询仓库详细
export function getStore(storeId) {
  return request({
    url: '/module/store/' + storeId,
    method: 'get'
  })
}

// 新增仓库
export function addStore(data) {
  return request({
    url: '/module/store',
    method: 'post',
    data: data
  })
}

// 修改仓库
export function updateStore(data) {
  return request({
    url: '/module/store',
    method: 'put',
    data: data
  })
}

// 删除仓库
export function delStore(storeId) {
  return request({
    url: '/module/store/' + storeId,
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
