module.exports = mongoose => {
    const Detections = mongoose.model(
      "detections",
      mongoose.Schema(
        {
          mask: Boolean,
          timestamp: Number,
        },
      ),
      "detections"
    );
  
    return Detections;
  };