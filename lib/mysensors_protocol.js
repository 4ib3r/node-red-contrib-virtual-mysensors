module.exports = {
  parse: function(msg) {
    var str = msg.split(";");
    return {
      nodeId: parseInt(str[0]),
      childId: parseInt(str[1]),
      command: parseInt(str[2]),
      ack: str[3] == "1",
      type: parseInt(str[4]),
      payload: str[5].trim()
    };
  },
  send: function(data) {
    if (typeof(data.payload) == "boolean") {
      data.payload = (data.payload ? 1 : 0);
    }
    var ack = data.ack ? "1" : "0";
    var str = data.nodeId + ";" + data.childId + ";" + data.command + ";" + ack + ";" + data.type + ";";
    str += data.payload;
    return str;
  }
};