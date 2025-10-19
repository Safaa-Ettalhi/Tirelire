const Message = require("../models/Message")

exports.sendMessage = async (req, res) => {
  try {
    const { groupId, type, content, audioUrl } = req.body

    if (!groupId) {
      return res.status(400).json({ message: "groupId is required" })
    }
    if (!type || !["text", "audio"].includes(type)) {
      return res.status(400).json({ message: 'type must be "text" or "audio"' })
    }

    if (type === "text" && !content) {
      return res.status(400).json({ message: "content is required for text messages" })
    }
    if (type === "audio" && !audioUrl) {
      return res.status(400).json({ message: "audioUrl is required for audio messages" })
    }

    const message = await Message.create({
      group: groupId,
      user: req.user._id,
      type,
      content: type === "text" ? content : null,
      audioUrl: type === "audio" ? audioUrl : null,
    })

    res.status(201).json({ message: "Message envoyé", data: message })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId }).populate("user")
    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
