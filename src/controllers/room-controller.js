const Database = require('../db/config')

module.exports = {
  async create(request, response) {
    const db = await Database()
    const pass = request.body.password
    let roomId = ''
    let alreadyExists = true

    while (alreadyExists) {
      /*Gera o número da sala */
      for (var i = 0; i < 6; i++) {
        roomId += Math.floor(Math.random() * 10).toString()
      }

      /*Verifica se o nr já existe */
      const roomsThatExist = await db.all(`SELECT id FROM rooms`)
      alreadyExists = roomsThatExist.some(roomExistId => roomExistId === roomId)

      if (!alreadyExists) {
        /*Insere a sala no banco de dados */
        await db.run(`INSERT INTO rooms (
          id,
          pass
        )VALUES(
          ${parseInt(roomId)},
          "${pass}"
        )`)
      }
    }

    await db.close()
    response.redirect(`/room/${roomId}`)
  },

  async open(request, response) {
    const db = await Database()
    const roomId = request.params.room
    const questions = await db.all(
      `SELECT * FROM questions WHERE room = ${roomId} and read = 0`
    )
    const questionsRead = await db.all(
      `SELECT * FROM questions WHERE room = ${roomId} and read = 1`
    )
    let isNoQuestions

    if (questions.length == 0) {
      if (questionsRead.length == 0) {
        isNoQuestions = true
      }
    }

    response.render('room', {
      roomId: roomId,
      questions: questions,
      questionsRead: questionsRead,
      isNoQuestions: isNoQuestions
    })
  },

  enter(request, response) {
    const roomId = request.body.roomId
    response.redirect(`/room/${roomId}`)
  }
}
