import { PaginationReqQuery } from '~/models/requests/utils.requests'

export type CreateNationReqBody = {
  flag: string
  name: string
}

export type NationIdReqParams = {
  nationId: string
}

export type GetNationsReqQuery = PaginationReqQuery & {
  name?: string
}
