import request from '@/utils/request'

// 查询货物类型列表
export function listGtype(query) {
  return request({
    url: '/module/gtype/list',
    method: 'get',
    params: query
  })
}

// 查询货物类型详细
export function getGtype(gtypeId) {
  return request({
    url: '/module/gtype/' + gtypeId,
    method: 'get'
  })
}

// 新增货物类型
export function addGtype(data) {
  return request({
    url: '/module/gtype',
    method: 'post',
    data: data
  })
}

// 修改货物类型
export function updateGtype(data) {
  return request({
    url: '/module/gtype',
    method: 'put',
    data: data
  })
}

// 删除货物类型
export function delGtype(gtypeId) {
  return request({
    url: '/module/gtype/' + gtypeId,
    method: 'delete'
  })
}


