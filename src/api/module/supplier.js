import request from '@/utils/request'

// 查询供货商列表
export function listSupplier(query) {
  return request({
    url: '/module/supplier/list',
    method: 'get',
    params: query
  })
}

// 查询供货商详细
export function getSupplier(supplierId) {
  return request({
    url: '/module/supplier/' + supplierId,
    method: 'get'
  })
}

// 新增供货商
export function addSupplier(data) {
  return request({
    url: '/module/supplier',
    method: 'post',
    data: data
  })
}

// 修改供货商
export function updateSupplier(data) {
  return request({
    url: '/module/supplier',
    method: 'put',
    data: data
  })
}

// 删除供货商
export function delSupplier(supplierId) {
  return request({
    url: '/module/supplier/' + supplierId,
    method: 'delete'
  })
}


