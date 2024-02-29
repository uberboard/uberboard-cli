
function init(config) {
  console.log("init")
}
function render(callback) {
  let now = new Date()
  callback({
    text1: now.toLocaleTimeString(),
    text2: now.toLocaleDateString()
  })
}
