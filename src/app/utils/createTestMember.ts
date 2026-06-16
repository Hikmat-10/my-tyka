// Utility to create a test member for development
export function createTestMember() {
  const testMember = {
    id: "member_test_1",
    email: "test@tyka.com",
    password: "test123",
    firstName: "Test",
    lastName: "User",
    phone: "+221 77 123 45 67",
    whatsapp: "+221 77 123 45 67",
    country: "Sénégal",
    city: "Dakar",
    bio: "Membre de test pour la plateforme TYKA",
    interests: ["Innovation", "Entrepreneuriat"],
    profileImage: "",
    activity: "Développeur",
    status: "member" as const,
    ambassadorCode: "TEUS1234",
    acquisitionSource: "facebook",
    ambassadorReferralCode: "",
    joinedAt: new Date().toISOString(),
    emailConfirmed: true,
    validationStatus: "active" as const,
    visibleInTrombinoscope: true,
    skills: [
      { name: "React", level: 4 },
      { name: "TypeScript", level: 4 }
    ],
    privacySettings: {
      showEmail: true,
      showWhatsApp: true,
      showPhone: true,
    },
    expertiseAreas: ["Développement web", "Innovation"],
    currentWork: "Développement de la plateforme TYKA",
    linkedin: "https://linkedin.com/in/test",
    facebook: "",
    website: "https://tyka.com",
    otherLinks: [],
  };

  // Get existing members
  const membersData = localStorage.getItem("tykaMembers");
  const members = membersData ? JSON.parse(membersData) : [];

  // Check if test member already exists
  const existingIndex = members.findIndex((m: any) => m.email === testMember.email);

  if (existingIndex >= 0) {
    // Update existing test member
    members[existingIndex] = testMember;
  } else {
    // Add new test member
    members.push(testMember);
  }

  // Save to localStorage
  localStorage.setItem("tykaMembers", JSON.stringify(members));

  console.log("✅ Membre de test créé:");
  console.log("Email: test@tyka.com");
  console.log("Mot de passe: test123");

  return testMember;
}
