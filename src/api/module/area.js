import request from '@/utils/request'

// 查询分区列表
export function listArea(query) {
  return request({
    url: '/module/area/list',
    method: 'get',
    params: query
  })
}

// 查询分区详细
export function getArea(areaId) {
  return request({
    url: '/module/area/' + areaId,
    method: 'get'
  })
}

// 新增分区
export function addArea(data) {
  return request({
    url: '/module/area',
    method: 'post',
    data: data
  })
}

// 修改分区
export function updateArea(data) {
  return request({
    url: '/module/area',
    method: 'put',
    data: data
  })
}

// 删除分区
export function delArea(areaId) {
  return request({
    url: '/module/area/' + areaId,
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

