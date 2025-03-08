var admin = require("firebase-admin");

// Check if Firebase is already initialized
if (!admin.apps.length) {
  var serviceAccount = require("./serviceAccountKey.json");
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://career-counselling-4c5e6-default-rtdb.firebaseio.com",
  });
}

const firestore = admin.firestore();

// Sample counselors data
const counselorsData = [
  {
    name: "Dr. Sarah Johnson",
    specialization: "Career Development Specialist",
    photoURL: "https://randomuser.me/api/portraits/women/1.jpg",
    experience: 12,
    rating: 4.9,
    sessionCount: 345,
    languages: ["English", "Spanish"],
    about: "Dr. Sarah Johnson is a certified career counselor with over 12 years of experience helping professionals navigate career transitions. She specializes in tech industry placements and executive coaching.",
    expertise: ["Career Transitions", "Resume Building", "Interview Preparation", "Tech Industry", "Executive Coaching"],
    availability: [
      {
        day: "monday",
        slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
      },
      {
        day: "wednesday",
        slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
      },
      {
        day: "friday",
        slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
      }
    ],
    bookedSlots: []
  },
  {
    name: "Michael Chen",
    specialization: "Technical Interview Coach",
    photoURL: "https://randomuser.me/api/portraits/men/2.jpg",
    experience: 8,
    rating: 4.8,
    sessionCount: 220,
    languages: ["English", "Mandarin"],
    about: "Michael is a former tech recruiter at Google who now helps candidates prepare for technical interviews at top tech companies. He provides personalized coaching on algorithms, system design, and behavioral questions.",
    expertise: ["Technical Interviews", "Algorithms", "System Design", "Behavioral Questions", "Coding Challenges"],
    availability: [
      {
        day: "tuesday",
        slots: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"]
      },
      {
        day: "thursday",
        slots: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"]
      },
      {
        day: "saturday",
        slots: ["10:00", "11:00", "12:00", "13:00"]
      }
    ],
    bookedSlots: []
  },
  {
    name: "Emma Rodriguez",
    specialization: "Educational Counselor",
    photoURL: "https://randomuser.me/api/portraits/women/3.jpg",
    experience: 10,
    rating: 4.7,
    sessionCount: 278,
    languages: ["English", "Spanish", "Portuguese"],
    about: "Emma specializes in helping students choose the right educational path for their career goals. With 10 years of experience in educational counseling, she provides guidance on college selection, course planning, and career alignment.",
    expertise: ["College Planning", "Course Selection", "Scholarship Applications", "Career Alignment", "Higher Education"],
    availability: [
      {
        day: "monday",
        slots: ["10:00", "11:00", "13:00", "14:00", "15:00"]
      },
      {
        day: "wednesday",
        slots: ["10:00", "11:00", "13:00", "14:00", "15:00"]
      },
      {
        day: "friday",
        slots: ["10:00", "11:00", "13:00", "14:00", "15:00"]
      }
    ],
    bookedSlots: []
  },
  {
    name: "Dr. James Wilson",
    specialization: "Professional Development Coach",
    photoURL: "https://randomuser.me/api/portraits/men/4.jpg",
    experience: 15,
    rating: 4.9,
    sessionCount: 412,
    languages: ["English"],
    about: "Dr. Wilson is an expert in professional development with a focus on leadership skills and executive presence. He has coached executives at Fortune 500 companies and helps professionals at all levels advance in their careers.",
    expertise: ["Leadership Development", "Executive Presence", "Public Speaking", "Networking", "Personal Branding"],
    availability: [
      {
        day: "tuesday",
        slots: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"]
      },
      {
        day: "thursday",
        slots: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"]
      }
    ],
    bookedSlots: []
  },
  {
    name: "Priya Patel",
    specialization: "Tech Career Advisor",
    photoURL: "https://randomuser.me/api/portraits/women/5.jpg",
    experience: 7,
    rating: 4.8,
    sessionCount: 185,
    languages: ["English", "Hindi"],
    about: "Priya is a specialist in helping professionals transition into tech careers. With experience as a tech recruiter and career advisor, she provides guidance on skill development, portfolio building, and job search strategies for tech roles.",
    expertise: ["Tech Career Transition", "Portfolio Development", "Skill Assessment", "Job Search Strategy", "Networking in Tech"],
    availability: [
      {
        day: "monday",
        slots: ["12:00", "13:00", "14:00", "18:00", "19:00", "20:00"]
      },
      {
        day: "wednesday",
        slots: ["12:00", "13:00", "14:00", "18:00", "19:00", "20:00"]
      },
      {
        day: "saturday",
        slots: ["09:00", "10:00", "11:00", "12:00"]
      }
    ],
    bookedSlots: []
  },
  {
    name: "Dr. Robert Taylor",
    specialization: "PhD & Graduate Studies Advisor",
    photoURL: "https://randomuser.me/api/portraits/men/6.jpg",
    experience: 20,
    rating: 4.9,
    sessionCount: 310,
    languages: ["English", "French", "German"],
    about: "Dr. Taylor is a former university professor with extensive experience in guiding students through graduate school applications and PhD programs. He helps students identify the right programs, prepare strong applications, and develop research proposals.",
    expertise: ["Graduate School Applications", "PhD Program Selection", "Research Proposals", "Academic Career Planning", "Scholarship Applications"],
    availability: [
      {
        day: "tuesday",
        slots: ["11:00", "12:00", "13:00", "14:00", "15:00"]
      },
      {
        day: "thursday",
        slots: ["11:00", "12:00", "13:00", "14:00", "15:00"]
      },
      {
        day: "friday",
        slots: ["11:00", "12:00", "13:00", "14:00"]
      }
    ],
    bookedSlots: []
  }
];

// Function to seed counselors with their availability
async function seedCounselors() {
  console.log('Starting to seed counselors...');
  
  try {
    const counselorsRef = firestore.collection('counselors');
    
    // Add each counselor to the collection
    for (const counselor of counselorsData) {
      // Generate available dates for this counselor
      const availableDates = generateAvailableDates(counselor);

      const counselorToSave = {
        ...counselor,
        availableDates: availableDates,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = await counselorsRef.add(counselorToSave);
      console.log(`Added counselor: ${counselor.name} with ID: ${docRef.id}`);

      // Create separate collection for available slots for better query performance
      await createAvailableSlots(docRef.id, counselor.availability, availableDates);
    }
    
    console.log('Counselors seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding counselors:', error);
  }
}

// Helper function to generate available dates for the next 30 days
function generateAvailableDates(counselor) {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  // Create a map of day name to available slots for quick lookup
  const availabilityMap = {};
  counselor.availability.forEach(dayAvailability => {
    availabilityMap[dayAvailability.day.toLowerCase()] = dayAvailability.slots;
  });
  
  // Generate dates for the next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayName = dayNames[date.getDay()].toLowerCase();
    const availableSlots = availabilityMap[dayName];
    
    // Add dates that have available slots
    if (availableSlots && availableSlots.length > 0) {
      // Filter out any slots that are in bookedSlots
      const dateStr = formatDate(date);
      const bookedSlotsForDate = (counselor.bookedSlots || []).filter(booking => 
        booking.date === dateStr
      ).map(booking => booking.slot);

      const availableSlotsForDate = availableSlots.map(slot => ({
        time: slot,
        isBooked: bookedSlotsForDate.includes(slot)
      }));

      dates.push({
        date: admin.firestore.Timestamp.fromDate(date),
        dayOfWeek: dayName,
        formattedDate: dateStr,
        isAvailable: true,
        slots: availableSlotsForDate,
        totalSlots: availableSlotsForDate.length,
        availableSlots: availableSlotsForDate.filter(slot => !slot.isBooked).length
      });
    }
  }
  
  return dates;
}

// Function to create available slots as a subcollection for each counselor
async function createAvailableSlots(counselorId, availabilityConfig, availableDates) {
  const slotsCollectionRef = firestore.collection(`counselors/${counselorId}/available_slots`);
  
  // First, delete any existing slots
  const existingSlots = await slotsCollectionRef.get();
  const batch = firestore.batch();
  existingSlots.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Create a new batch for adding slots
  const addBatch = firestore.batch();
  
  for (const dateInfo of availableDates) {
    const slotDoc = slotsCollectionRef.doc(dateInfo.formattedDate);
    addBatch.set(slotDoc, {
      date: dateInfo.date,
      dayOfWeek: dateInfo.dayOfWeek,
      formattedDate: dateInfo.formattedDate,
      slots: dateInfo.slots,
      isAvailable: true,
      totalSlots: dateInfo.totalSlots,
      availableSlots: dateInfo.availableSlots,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  
  await addBatch.commit();
  console.log(`Created ${availableDates.length} available slot documents for counselor ${counselorId}`);
}

// Helper function to format date as YYYY-MM-DD for easy comparison
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Create categories for counselors
async function createCounselorCategories() {
  try {
    const categoriesRef = firestore.collection("counselor_categories");
    
    const categories = [
      {
        id: "career",
        name: "Career Development",
        description: "Specialists who help with career transitions and growth",
        icon: "briefcase-outline",
        counselorCount: 2, 
      },
      {
        id: "technical",
        name: "Technical Interviews",
        description: "Experts who prepare candidates for technical job interviews",
        icon: "code-outline",
        counselorCount: 1,
      },
      {
        id: "education",
        name: "Education Planning",
        description: "Counselors who help with education and academic decisions",
        icon: "school-outline", 
        counselorCount: 2,
      },
      {
        id: "professional",
        name: "Professional Development",
        description: "Coaches who help develop professional skills and presence",
        icon: "trending-up-outline",
        counselorCount: 1,
      }
    ];

    // Add each category
    for (const category of categories) {
      await categoriesRef.doc(category.id).set(category);
      console.log(`Category ${category.name} added successfully.`);
    }

    console.log(`${categories.length} counselor categories added to Firestore!`);
  } catch (error) {
    console.error("Error creating counselor categories:", error);
  }
}

// Running both functions
async function seedDatabase() {
  try {
    console.log("Starting database seeding process...");
    await createCounselorCategories();
    await seedCounselors();
    
    console.log("Counselor database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error in seeding process:", error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();