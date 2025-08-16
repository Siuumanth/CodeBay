import pool from "../config/db.js";

// Get all projects by user
export const getProjectsByUser = async (req, res) => {
  try {
    const userId = req.user.id; //  auth middleware sets req.user
    const result = await pool.query(
      "SELECT * FROM projects WHERE createdBy = $1",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

// Get single project
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // join with deployments to get last status + URL
    const result = await pool.query(
      `SELECT p.id, p.gitUrl, d.status AS lastStatus
       FROM projects p
       LEFT JOIN LATERAL (
         SELECT status FROM deployments 
         WHERE projectId = p.id
         ORDER BY createdAt DESC LIMIT 1
       ) d ON true
       WHERE p.id = $1 AND p.createdBy = $2`,
      [id, userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Project not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // only delete if owned by user
    const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 AND createdBy = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Project not found or not authorized" });

    res.json({ message: "Project deleted", project: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete project" });
  }
};
