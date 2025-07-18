import { Collection, Db, MongoClient } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import Image from '~/models/databases/Image'
import League from '~/models/databases/League'
import Nation from '~/models/databases/Nation'
import { RefreshToken } from '~/models/databases/RefreshToken'
import User from '~/models/databases/User'

const uri = `mongodb+srv://${ENV_CONFIG.DB_USERNAME}:${ENV_CONFIG.DB_PASSWORD}@whoareyoucluster.ocwbpmd.mongodb.net/?retryWrites=true&w=majority&appName=WhoAreYouCluster`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(ENV_CONFIG.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  get users(): Collection<User> {
    return this.db.collection(ENV_CONFIG.DB_USERS_COLLECTION)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(ENV_CONFIG.DB_REFRESH_TOKENS_COLLECTION)
  }

  get images(): Collection<Image> {
    return this.db.collection(ENV_CONFIG.DB_IMAGES_COLLECTION)
  }

  get nations(): Collection<Nation> {
    return this.db.collection(ENV_CONFIG.DB_NATIONS_COLLECTION)
  }

  get leagues(): Collection<League> {
    return this.db.collection(ENV_CONFIG.DB_LEAGUES_COLLECTION)
  }
}

const databaseService = new DatabaseService()
export default databaseService
