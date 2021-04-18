module.exports = mongoose => {
    const Violations = mongoose.model(
      "dist_violations",
      mongoose.Schema(
        {
          timestamp: Number,
        },
      ),
      "dist_violations"
    );
  
    return Violations;
  };