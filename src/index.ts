import express from 'express'

import { ENV_CONFIG } from '~/constants/config'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import imagesRouter from '~/routes/images.routes'
import leaguesRouter from '~/routes/leagues.routes'
import nationsRouter from '~/routes/nations.routes'
import staticRouter from '~/routes/static.routes'
import teamsRouter from '~/routes/teams.routes'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { initFolders } from '~/utils/file'

databaseService.connect()

initFolders()

const app = express()
const port = ENV_CONFIG.PORT ?? 4000

app.use(express.json())
app.use('/users', usersRouter)
app.use('/images', imagesRouter)
app.use('/static', staticRouter)
app.use('/nations', nationsRouter)
app.use('/leagues', leaguesRouter)
app.use('/teams', teamsRouter)
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
