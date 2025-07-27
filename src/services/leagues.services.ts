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

  async aggregateLeague({ match = {}, skip = 0, limit = 20 }: { match?: object; skip?: number; limit?: number }) {
    const leagues = await databaseService.leagues
      .aggregate([
        {
          $match: match
        },
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
              url: {
                $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$logo.name']
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
            'logo.name': 0,
            'logo.createdAt': 0,
            'logo.updatedAt': 0
          }
        }
      ])
      .toArray()
    return {
      leagues
    }
  }

  async findMany(query: PaginationReqQuery) {
    const { page, limit, skip } = configurePagination(query)
    const [{ leagues }, totalLeagues] = await Promise.all([
      this.aggregateLeague({ limit, skip }),
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

  async findOne(leagueId: ObjectId) {
    const { leagues } = await this.aggregateLeague({
      match: {
        _id: leagueId
      }
    })
    return {
      league: leagues[0]
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
