import { ObjectId } from 'mongodb'
import omitBy from 'lodash/omitBy'
import isUndefined from 'lodash/isUndefined'

import { ENV_CONFIG } from '~/constants/config'
import Nation from '~/models/databases/Nation'
import { CreateNationReqBody, GetNationsReqQuery } from '~/models/requests/nations.requests'
import databaseService from '~/services/database.services'
import { configurePagination } from '~/utils/helpers'

class NationsService {
  async insertOne(body: CreateNationReqBody) {
    const { insertedId } = await databaseService.nations.insertOne(
      new Nation({
        ...body,
        flag: new ObjectId(body.flag)
      })
    )
    const nation = await databaseService.nations.findOne({
      _id: insertedId
    })
    return {
      nation
    }
  }

  async aggregateNation({ match = {}, skip = 0, limit = 20 }: { match?: object; skip?: number; limit?: number }) {
    const [nations, totalNations] = await Promise.all([
      databaseService.nations
        .aggregate([
          {
            $match: match
          },
          {
            $lookup: {
              from: 'images',
              localField: 'flag',
              foreignField: '_id',
              as: 'flag'
            }
          },
          {
            $unwind: {
              path: '$flag'
            }
          },
          {
            $addFields: {
              flag: {
                url: {
                  $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$flag.name']
                }
              }
            }
          },
          {
            $sort: {
              name: 1
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          },
          {
            $project: {
              'flag.name': 0,
              'flag.createdAt': 0,
              'flag.updatedAt': 0
            }
          }
        ])
        .toArray(),
      databaseService.nations
        .aggregate([
          {
            $match: match
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])
    return {
      nations,
      totalNations: totalNations[0]?.total ?? 0
    }
  }

  async findMany(query: GetNationsReqQuery) {
    const { page, limit, skip } = configurePagination(query)
    const text = query.name
      ? {
          $text: {
            $search: query.name
          }
        }
      : {}
    const match = omitBy(
      {
        ...text
      },
      isUndefined
    )
    const { nations, totalNations } = await this.aggregateNation({ match, limit, skip })
    return {
      nations,
      page,
      limit,
      totalRows: totalNations,
      totalPages: Math.ceil(totalNations / limit)
    }
  }

  async findOne(nationId: ObjectId) {
    const { nations } = await this.aggregateNation({
      match: {
        _id: nationId
      }
    })
    return {
      nation: nations[0]
    }
  }

  async updateOne({ body, nationId }: { body: CreateNationReqBody; nationId: ObjectId }) {
    const nation = await databaseService.nations.findOneAndUpdate(
      {
        _id: nationId
      },
      {
        $set: {
          ...body,
          flag: new ObjectId(body.flag)
        },
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return {
      nation
    }
  }

  async deleteOne(nationId: ObjectId) {
    await databaseService.nations.deleteOne({
      _id: nationId
    })
    return true
  }
}

const nationsService = new NationsService()
export default nationsService
