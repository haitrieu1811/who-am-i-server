import { PaginationReqQuery } from '~/models/requests/utils.requests'

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((item) => typeof item === 'number') as number[]
}

export const configurePagination = (query: PaginationReqQuery) => {
  const { page, limit } = query
  const _page = Number(page) || 1
  const _limit = Number(limit) || 20
  const skip = (_page - 1) * _limit
  return {
    page: _page,
    limit: _limit,
    skip
  }
}
