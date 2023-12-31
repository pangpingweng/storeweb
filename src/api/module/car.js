import request from '@/utils/request'

// 查询车辆列表
export function listCar(query) {
  return request({
    url: '/module/car/list',
    method: 'get',
    params: query
  })
}

// 查询车辆详细
export function getCar(carId) {
  return request({
    url: '/module/car/' + carId,
    method: 'get'
  })
}

// 新增车辆
export function addCar(data) {
  return request({
    url: '/module/car',
    method: 'post',
    data: data
  })
}

// 修改车辆
export function updateCar(data) {
  return request({
    url: '/module/car',
    method: 'put',
    data: data
  })
}

// 删除车辆
export function delCar(carId) {
  return request({
    url: '/module/car/' + carId,
    method: 'delete'
  })
}


