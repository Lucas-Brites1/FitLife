function calculateTrainingTime(entryTime, exitTime) {
  if(!exitTime || !entryTime ) return 0
  if(entryTime > exitTime) {
    exitTime += 24
  }

  const total = exitTime - entryTime
  return total
}

function setCategory(trainingTimeInHours) {
  let category;
  if (trainingTimeInHours <= 5) {
    category = "Iniciante"
  } 
  else if (trainingTimeInHours > 5 && trainingTimeInHours <= 10) {
    category = "Intermediário"
  }
  else if (trainingTimeInHours > 10 && trainingTimeInHours <= 20) {
    category = "Avançado"
  } 
  else {
    category = "Extremamente avançado"
  }
  return category
}

module.exports = { calculateTrainingTime, setCategory }