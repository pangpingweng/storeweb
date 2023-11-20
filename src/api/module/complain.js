import request from '@/utils/request'

// 查询投诉列表
export function listComplain(query) {
  return request({
    url: '/module/complain/list',
    method: 'get',
    params: query
  })
}

// 查询投诉详细
export function getComplain(complainId) {
  return request({
    url: '/module/complain/' + complainId,
    method: 'get'
  })
}

// 新增投诉
export function addComplain(data) {
  return request({
    url: '/module/complain',
    method: 'post',
    data: data
  })
}

// 修改投诉
export function updateComplain(data) {
  return request({
    url: '/module/complain',
    method: 'put',
    data: data
  })
}

// 删除投诉
export function delComplain(complainId) {
  return request({
    url: '/module/complain/' + complainId,
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

export function getshipList(query) {
  return request({
    url: '/module/ship/allList',
    method: 'get',
    params: query
  })
}
