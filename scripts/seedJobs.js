var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://career-counselling-4c5e6-default-rtdb.firebaseio.com"
});


const firestore = admin.firestore();

async function addJobs() {
  const jobsRef = firestore.collection('jobs');

  // Define an array of 20 unique job titles
  const jobTitles = [
    "Senior React Native Developer",
    "Junior React Native Developer",
    "Full-Stack React Native Engineer",
    "Mobile App Developer (React Native)",
    "React Native Software Engineer",
    "Lead React Native Developer",
    "React Native UI/UX Developer",
    "React Native Application Developer",
    "React Native Mobile Engineer",
    "React Native Technical Lead",
    "React Native DevOps Engineer",
    "React Native Consultant",
    "React Native Architect",
    "React Native Frontend Developer",
    "React Native Backend Developer",
    "React Native Integration Specialist",
    "React Native QA Engineer",
    "React Native Project Manager",
    "React Native System Analyst",
    "React Native Product Developer"
  ];

  // Loop over the job titles array to create unique job documents
  for (let i = 0; i < jobTitles.length; i++) {
    // Generate a unique job ID (e.g., job001, job002, etc.)
    const jobId = `job${String(i + 1).padStart(3, '0')}`;

    // Create the job document with a unique title and image
    const jobData = {
      job_id: jobId, // This can be the document ID or a separate field
      job_title: jobTitles[i], // Unique title from the array
      employer_name: "Tech Innovations Inc.",
      // Generate a unique employer logo using a seed based on jobId
      employer_logo: `https://picsum.photos/seed/${jobId}/300/200`,
      job_description:
        "We're looking for an experienced React Native developer to join our mobile app development team. You will be responsible for building and maintaining high-quality mobile applications for both iOS and Android platforms...",
      job_country: "United States",
      job_city: "San Francisco",
      job_apply_link:
        "https://techinnovations.com/careers/senior-react-native-developer",
      job_google_link:
        "https://www.google.com/jobs?q=tech+innovations+react+native",
      job_publisher: "LinkedIn",
      job_highlights: {
        Qualifications: [
          "5+ years of experience with React Native",
          "Strong knowledge of JavaScript/TypeScript",
          "Experience with state management (Redux, MobX, etc.)",
          "Familiarity with native build tools"
        ],
        Responsibilities: [
          "Develop mobile applications using React Native",
          "Collaborate with the design team to implement UI/UX",
          "Write clean, maintainable code",
          "Troubleshoot and debug applications"
        ],
        Benefits: [
          "Competitive salary",
          "Health insurance",
          "Flexible work hours",
          "Remote work options"
        ]
      },
      applications: 47,
      salary_min: 120000,
      salary_max: 150000,
      salary_currency: "USD",
      job_employment_type: "Full-time",
      job_experience_level: "Senior",
      // Using ISO date strings to avoid month-index confusion (month is 0-indexed in Date(year, month, day))
      posted_at: admin.firestore.Timestamp.fromDate(new Date("2023-06-15")),
      expiry_date: admin.firestore.Timestamp.fromDate(new Date("2023-08-15")),
      is_remote: true,
      tags: ["react-native", "javascript", "mobile", "development", "typescript"],
      location_coordinates: new admin.firestore.GeoPoint(37.7749, -122.4194),
    };

    // Add the job document to the "jobs" collection
    await jobsRef.doc(jobId).set(jobData);
    console.log(`Job ${jobId} added successfully.`);
  }

  console.log('20 jobs added to Firestore!');
}

addJobs().catch((error) => {
  console.error('Error adding jobs: ', error);
});
