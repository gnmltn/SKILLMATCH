import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();


router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("projectHistory firstName lastName profilePicture");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   
    const projects = user.projectHistory.map(project => {
      const teamMembers = project.team ? project.team.split(',').map(member => member.trim()) : [];
      const teamSize = teamMembers.length;

      return {
        id: project._id,
        title: project.project,
        role: project.role,
        teamSize: teamSize, 
        skills: project.skills || [],
        performance: project.score,
        date: project.date,
        teamMembers: teamMembers,
        notes: project.description || "",
        imageUrl: project.imageUrl || "",
        projectImages: project.projectImages || [],
        projectUrl: project.projectUrl || "",
        expanded: false
      };
    });

    return res.status(200).json({
      success: true,
      projects,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error("Error fetching role history:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


router.post("/", protect, async (req, res) => {
  try {
    const { 
      title, 
      role, 
      teamMembers, 
      skills, 
      performance, 
      date, 
      notes,
      imageUrl,
      projectImages,
      projectUrl
    } = req.body;

  
    if (!title || !role || !performance || !date) {
      return res.status(400).json({ 
        message: "Title, role, performance score, and date are required" 
      });
    }

    if (performance < 0 || performance > 100) {
      return res.status(400).json({ 
        message: "Performance score must be between 0 and 100" 
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   
    const teamSize = teamMembers ? teamMembers.length : 0;
    const teamString = teamMembers ? teamMembers.join(', ') : '';

   
    const newProject = {
      project: title.trim(),
      role: role.trim(),
      date: date.trim(),
      team: teamString,
      skills: skills || [],
      score: parseFloat(performance),
      description: notes || "",
      imageUrl: imageUrl || "",
      projectImages: projectImages || [],
      projectUrl: projectUrl || ""
    };

    user.projectHistory.push(newProject);
    await user.save();

    const savedProject = user.projectHistory[user.projectHistory.length - 1];


    const responseProject = {
      id: savedProject._id,
      title: savedProject.project,
      role: savedProject.role,
      teamSize: teamSize, 
      skills: savedProject.skills || [],
      performance: savedProject.score,
      date: savedProject.date,
      teamMembers: teamMembers || [],
      notes: savedProject.description || "",
      imageUrl: savedProject.imageUrl || "",
      projectImages: savedProject.projectImages || [],
      projectUrl: savedProject.projectUrl || "",
      expanded: false
    };

    return res.status(201).json({
      success: true,
      message: "Project added successfully",
      project: responseProject
    });
  } catch (error) {
    console.error("Error adding project:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
});


router.patch("/:projectId", protect, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { 
      title, 
      role, 
      teamMembers, 
      skills, 
      performance, 
      date, 
      notes,
      imageUrl,
      projectImages,
      projectUrl
    } = req.body;

    if (performance && (performance < 0 || performance > 100)) {
      return res.status(400).json({ 
        message: "Performance score must be between 0 and 100" 
      });
    }

    let user;
    let retries = 3;
    
    while (retries > 0) {
      try {
        user = await User.findById(req.user._id);
        const project = user.projectHistory.id(projectId);

        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }

        const teamSize = teamMembers ? teamMembers.length : 0;
        const teamString = teamMembers ? teamMembers.join(', ') : '';

        if (title !== undefined) project.project = title.trim();
        if (role !== undefined) project.role = role.trim();
        if (date !== undefined) project.date = date.trim();
        if (teamMembers !== undefined) project.team = teamString;
        if (skills !== undefined) project.skills = skills;
        if (performance !== undefined) project.score = parseFloat(performance);
        if (notes !== undefined) project.description = notes;
        if (imageUrl !== undefined) project.imageUrl = imageUrl.trim();
        if (projectImages !== undefined) project.projectImages = projectImages;
        if (projectUrl !== undefined) project.projectUrl = projectUrl.trim();

        await user.save();
        break; // Success, exit retry loop
        
      } catch (error) {
        if (error.name === 'VersionError' && retries > 1) {
          retries--;
          continue; // Retry
        } else {
          throw error;
        }
      }
    }

    // Refresh the user data to get the latest version
    user = await User.findById(req.user._id);
    const project = user.projectHistory.id(projectId);
    
    const responseProject = {
      id: project._id,
      title: project.project,
      role: project.role,
      teamSize: teamMembers ? teamMembers.length : 0,
      skills: project.skills || [],
      performance: project.score,
      date: project.date,
      teamMembers: teamMembers || [],
      notes: project.description || "",
      imageUrl: project.imageUrl || "",
      projectImages: project.projectImages || [],
      projectUrl: project.projectUrl || "",
      expanded: false
    };

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: responseProject
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
  }
});


router.delete("/:projectId", protect, async (req, res) => {
  try {
    const { projectId } = req.params;

    const user = await User.findById(req.user._id);
    const project = user.projectHistory.id(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    user.projectHistory.pull(projectId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


router.get("/summary", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("projectHistory");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const projects = user.projectHistory;

  
    const totalProjects = projects.length;
    
    const avgPerformance = totalProjects > 0 
      ? Math.round(projects.reduce((sum, project) => sum + project.score, 0) / totalProjects)
      : 0;
    
    
    const totalTeamMembers = projects.reduce((sum, project) => {
      if (project.team) {
        
        const teamMembers = project.team.split(',').map(member => member.trim()).filter(member => member.length > 0);
        return sum + teamMembers.length;
      }
      return sum;
    }, 0);
    
    const allSkills = projects.flatMap(project => project.skills || []);
    const uniqueSkills = [...new Set(allSkills)];
    const totalSkillsApplied = uniqueSkills.length;

    const summaryStats = [
      { label: "Total Projects", value: totalProjects },
      { label: "Avg Performance", value: avgPerformance },
      { label: "Team Members", value: totalTeamMembers },
      { label: "Skills Applied", value: totalSkillsApplied }
    ];

    return res.status(200).json({
      success: true,
      summaryStats
    });
  } catch (error) {
    console.error("Error fetching summary stats:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;