function formatDate(date) {
  return date.toISOString().split("T")[0] // YYYY-MM-DD today.toISOString() ->'2024-11-12T19:53:11.150Z'.split("T") -> ["2024-11-12", "T19:53:11.150Z"] 
}

function getSevenDaysBack(todayDate) {
  const date = new Date(todayDate)
  date.setDate(date.getDate() - 6)
  return date.toISOString().split("T")[0]  // YYYY-MM-DD today.toISOString() ->'2024-11-12T19:53:11.150Z'.split("T") -> ["2024-11-12", "T19:53:11.150Z"] 
}

module.exports = { formatDate, getSevenDaysBack }