import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import Nation from '~/models/databases/Nation'
import { CreateNationReqBody } from '~/models/requests/nations.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
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

  async findMany(query: PaginationReqQuery) {
    const { page, limit, skip } = configurePagination(query)
    const [nations, totalNations] = await Promise.all([
      databaseService.nations
        .aggregate([
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
                $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$flag.name']
              }
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      databaseService.nations.countDocuments({})
    ])
    return {
      nations,
      page,
      limit,
      totalRows: totalNations,
      totalPages: Math.ceil(totalNations / limit)
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
