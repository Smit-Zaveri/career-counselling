var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://career-counselling-4c5e6-default-rtdb.firebaseio.com",
});

const firestore = admin.firestore();

async function createCategories() {
  const categoriesRef = firestore.collection("job_categories");

  // Define categories
  const categories = [
    {
      id: "tech",
      name: "Technology",
      description: "Software development, IT, and technical roles",
      icon: "laptop-outline",
      jobCount: 0, // Will be updated after adding jobs
    },
    {
      id: "design",
      name: "Design",
      description: "UI/UX Design, Graphic Design, and creative roles",
      icon: "brush-outline",
      jobCount: 0,
    },
    {
      id: "marketing",
      name: "Marketing",
      description:
        "Digital marketing, SEO, social media, and advertising roles",
      icon: "megaphone-outline",
      jobCount: 0,
    },
    {
      id: "business",
      name: "Business",
      description: "Business development, sales, and management roles",
      icon: "briefcase-outline",
      jobCount: 0,
    },
    {
      id: "remote",
      name: "Remote",
      description: "Jobs that can be performed remotely from anywhere",
      icon: "home-outline",
      jobCount: 0,
    },
  ];

  // Add each category
  for (const category of categories) {
    await categoriesRef.doc(category.id).set(category);
    console.log(`Category ${category.name} added successfully.`);
  }

  console.log(`${categories.length} categories added to Firestore!`);
  return categories;
}

async function addJobs(categories) {
  const jobsRef = firestore.collection("jobs");
  const categoryCounts = {};

  // Initialize category counts
  categories.forEach((cat) => {
    categoryCounts[cat.id] = 0;
  });

  // Define an array of job titles
  const jobTitles = [
    {
      title: "Senior React Native Developer",
      category: "tech",
      isPopular: true,
    },
    {
      title: "Junior React Native Developer",
      category: "tech",
      isPopular: false,
    },
    {
      title: "Full-Stack React Native Engineer",
      category: "tech",
      isPopular: true,
    },
    {
      title: "Mobile App Developer (React Native)",
      category: "tech",
      isPopular: true,
    },
    {
      title: "React Native Software Engineer",
      category: "tech",
      isPopular: false,
    },
    {
      title: "UI/UX Designer for Mobile Apps",
      category: "design",
      isPopular: true,
    },
    { title: "Senior Product Designer", category: "design", isPopular: false },
    {
      title: "Graphic Designer for Mobile Apps",
      category: "design",
      isPopular: true,
    },
    { title: "UX Researcher", category: "design", isPopular: false },
    {
      title: "Digital Marketing Specialist",
      category: "marketing",
      isPopular: true,
    },
    { title: "SEO Strategist", category: "marketing", isPopular: false },
    {
      title: "Content Marketing Manager",
      category: "marketing",
      isPopular: true,
    },
    {
      title: "Social Media Coordinator",
      category: "marketing",
      isPopular: false,
    },
    {
      title: "Business Development Manager",
      category: "business",
      isPopular: true,
    },
    { title: "Sales Representative", category: "business", isPopular: false },
    { title: "Account Executive", category: "business", isPopular: true },
    {
      title: "Remote React Native Developer",
      category: "remote",
      isPopular: true,
    },
    { title: "Remote UI/UX Designer", category: "remote", isPopular: true },
    {
      title: "Remote Marketing Specialist",
      category: "remote",
      isPopular: false,
    },
    { title: "Remote Business Analyst", category: "remote", isPopular: false },
  ];

  // Loop over the job titles array to create unique job documents
  for (let i = 0; i < jobTitles.length; i++) {
    // Generate a unique job ID (e.g., job001, job002, etc.)
    const jobId = `job${String(i + 1).padStart(3, "0")}`;
    const jobInfo = jobTitles[i];
    const categoryId = jobInfo.category;

    // Update counter for this category
    categoryCounts[categoryId]++;

    // Create the job document with a unique title and category
    const jobData = {
      job_id: jobId,
      job_title: jobInfo.title,
      employer_name: `${
        categoryId.charAt(0).toUpperCase() + categoryId.slice(1)
      } Innovations Inc.`,
      employer_logo: `https://picsum.photos/seed/${jobId}/300/200`,
      job_description: `We're looking for a talented ${jobInfo.title} to join our team. You'll be working on cutting-edge projects in the ${categoryId} field...`,
      job_country: "United States",
      job_city: "San Francisco",
      job_apply_link: `https://example.com/careers/${jobId}`,
      job_google_link: `https://www.google.com/jobs?q=${jobInfo.title.replace(
        /\s+/g,
        "+"
      )}`,
      job_publisher: "LinkedIn",
      job_category_id: categoryId, // Add the category ID
      job_highlights: {
        Qualifications: [
          "5+ years of experience in the field",
          "Strong knowledge of relevant technologies",
          "Excellent communication skills",
          "Problem-solving mindset",
        ],
        Responsibilities: [
          `Develop solutions for ${categoryId} projects`,
          "Collaborate with cross-functional teams",
          "Ensure high-quality deliverables",
          "Contribute to project planning and execution",
        ],
        Benefits: [
          "Competitive salary",
          "Health insurance",
          "Flexible work hours",
          "Remote work options",
        ],
      },
      applications: Math.floor(Math.random() * 100) + 5, // Random number of applications
      salary_min: 90000 + Math.floor(Math.random() * 30000),
      salary_max: 130000 + Math.floor(Math.random() * 40000),
      salary_currency: "USD",
      job_employment_type: Math.random() > 0.3 ? "Full-time" : "Contract",
      job_experience_level: Math.random() > 0.5 ? "Senior" : "Mid-Level",
      posted_at: admin.firestore.Timestamp.fromDate(
        new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        )
      ),
      expiry_date: admin.firestore.Timestamp.fromDate(
        new Date(
          Date.now() + Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000
        )
      ),
      job_is_remote: categoryId === "remote" || Math.random() > 0.7,
      tags: [
        categoryId,
        jobInfo.title.toLowerCase().split(" ")[0],
        "job",
        "career",
      ],
      location_coordinates: new admin.firestore.GeoPoint(37.7749, -122.4194),
      popularity: jobInfo.isPopular
        ? Math.floor(Math.random() * 50) + 50
        : Math.floor(Math.random() * 30), // Higher for popular jobs
      job_views: Math.floor(Math.random() * 1000) + 100,
      isPopular: jobInfo.isPopular, // Flag to mark if job is popular
    };

    // Add the job document to the "jobs" collection
    await jobsRef.doc(jobId).set(jobData);
    console.log(
      `Job ${jobId} (${jobInfo.title}) added successfully in category ${categoryId}.`
    );
  }

  // Update job counts in categories
  const categoriesRef = firestore.collection("job_categories");

  for (const categoryId in categoryCounts) {
    await categoriesRef.doc(categoryId).update({
      jobCount: categoryCounts[categoryId],
    });
    console.log(
      `Updated job count for category ${categoryId} to ${categoryCounts[categoryId]}`
    );
  }

  console.log(`${jobTitles.length} jobs added to Firestore!`);
}

async function seedDatabase() {
  try {
    // First create categories
    const categories = await createCategories();

    // Then add jobs linked to those categories
    await addJobs(categories);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seeding function
seedDatabase();
