import pool from "../config/db.js";

// Get all deployments of a user
export const getDeployments = async (req, res) => {
  try {
    const userId = req.user.id;

    const deployments = await pool.query(
      `SELECT d.*
       FROM deployments d
       JOIN projects p ON d.projectId = p.id
       WHERE p.createdBy = $1
       ORDER BY d.createdAt DESC`,
      [userId]
    );

    res.json(deployments.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch deployments" });
  }
};



// Get single deployment + logs
export const getDeploymentWithLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
        `SELECT d.*, l.logs
         FROM deployments d
         LEFT JOIN log_events l ON l.deploymentId = d.id
         WHERE d.id = $1
           AND d.projectId IN (
             SELECT id FROM projects WHERE createdBy = $2
          );
        `,
      [id, userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Deployment not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch deployment logs" });
  }
};
