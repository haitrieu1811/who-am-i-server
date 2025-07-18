import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import League from '~/models/databases/League'
import { CreateLeagueReqBody } from '~/models/requests/leagues.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import databaseService from '~/services/database.services'
import { configurePagination } from '~/utils/helpers'

class LeaguesService {
  async insertOne(body: CreateLeagueReqBody) {
    const { insertedId } = await databaseService.leagues.insertOne(
      new League({
        ...body,
        logo: new ObjectId(body.logo)
      })
    )
    const league = await databaseService.leagues.findOne({
      _id: insertedId
    })
    return {
      league
    }
  }

  async findMany(query: PaginationReqQuery) {
    const { page, limit, skip } = configurePagination(query)
    const [leagues, totalLeagues] = await Promise.all([
      databaseService.leagues
        .aggregate([
          {
            $lookup: {
              from: 'images',
              localField: 'logo',
              foreignField: '_id',
              as: 'logo'
            }
          },
          {
            $unwind: {
              path: '$logo'
            }
          },
          {
            $addFields: {
              logo: {
                $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$logo.name']
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
      databaseService.leagues.countDocuments({})
    ])
    return {
      leagues,
      page,
      limit,
      totalRows: totalLeagues,
      totalPages: Math.ceil(totalLeagues / limit)
    }
  }

  async updateOne({ body, leagueId }: { body: CreateLeagueReqBody; leagueId: ObjectId }) {
    const league = await databaseService.leagues.findOneAndUpdate(
      {
        _id: leagueId
      },
      {
        $set: {
          ...body,
          logo: new ObjectId(body.logo)
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
      league
    }
  }

  async deleteOne(leagueId: ObjectId) {
    await databaseService.leagues.deleteOne({
      _id: leagueId
    })
    return true
  }
}

const leaguesService = new LeaguesService()
export default leaguesService
