import request from '@/utils/request'

// 查询报警列表
export function listWarn(query) {
  return request({
    url: '/module/warn/list',
    method: 'get',
    params: query
  })
}

// 查询报警详细
export function getWarn(warnId) {
  return request({
    url: '/module/warn/' + warnId,
    method: 'get'
  })
}

// 新增报警
export function addWarn(data) {
  return request({
    url: '/module/warn',
    method: 'post',
    data: data
  })
}

// 修改报警
export function updateWarn(data) {
  return request({
    url: '/module/warn',
    method: 'put',
    data: data
  })
}

// 删除报警
export function delWarn(warnId) {
  return request({
    url: '/module/warn/' + warnId,
    method: 'delete'
  })
}

  export function getareaList(query) {
    return request({
      url: '/module/area/allList',
      method: 'get',
      params: query
    })
  }

