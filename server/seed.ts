import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
  users,
  clinics,
  specialties,
  clinicSpecialties,
  ratings,
  comments,
} from "../drizzle/schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL as string);
  const db = drizzle(connection);

  console.log("🌱 Starting seed...");

  try {
    // Create specialties
    const specialtiesData = [
      { name: "Cardiologia" },
      { name: "Dermatologia" },
      { name: "Oftalmologia" },
      { name: "Odontologia" },
      { name: "Pediatria" },
      { name: "Psicologia" },
      { name: "Fisioterapia" },
      { name: "Nutrição" },
    ];

    await db
      .insert(specialties)
      .values(specialtiesData)
      .onDuplicateKeyUpdate({ set: { name: specialtiesData[0].name } });

    const allSpecialties = await db.select().from(specialties);
    console.log(`✓ Created ${allSpecialties.length} specialties`);

    // Create clinics
    const clinicsData = [
      {
        name: "Clínica Saúde Plus",
        description: "Clínica completa com atendimento 24h",
        address: "Rua das Flores, 123",
        city: "Luanda",
        state: "Luanda",
        zipCode: "1000",
        phone: "+244 222 123 456",
        email: "contato@saudeplus.ao",
        website: "https://saudeplus.ao",
        latitude: "-8.8383",
        longitude: "13.2344",
        openingHours: "Seg-Dom: 08:00 - 20:00",
        adminUserId: 1,
        isVerified: true,
        averageRating: 4.5,
        totalRatings: 12,
      },
      {
        name: "Clínica Vida",
        description: "Especializada em medicina preventiva",
        address: "Av. Principal, 456",
        city: "Luanda",
        state: "Luanda",
        zipCode: "1001",
        phone: "+244 222 234 567",
        email: "info@clinicavida.ao",
        website: "https://clinicavida.ao",
        latitude: "-8.8400",
        longitude: "13.2400",
        openingHours: "Seg-Sex: 07:00 - 19:00",
        adminUserId: 2,
        isVerified: true,
        averageRating: 4.8,
        totalRatings: 25,
      },
      {
        name: "Centro Médico Bem-Estar",
        description: "Centro de saúde com especialistas renomados",
        address: "Rua da Paz, 789",
        city: "Luanda",
        state: "Luanda",
        zipCode: "1002",
        phone: "+244 222 345 678",
        email: "contato@bemestarclinica.ao",
        website: "https://bemestarclinica.ao",
        latitude: "-8.8350",
        longitude: "13.2300",
        openingHours: "Seg-Dom: 09:00 - 18:00",
        adminUserId: 3,
        isVerified: true,
        averageRating: 4.3,
        totalRatings: 18,
      },
    ];

    await db
      .insert(clinics)
      .values(clinicsData)
      .onDuplicateKeyUpdate({ set: { name: clinicsData[0].name } });

    const allClinics = await db.select().from(clinics);
    console.log(`✓ Created ${allClinics.length} clinics`);

    // Associate specialties with clinics
    const clinicSpecialtiesData = [
      { clinicId: 1, specialtyId: 1 }, // Clínica Saúde Plus - Cardiologia
      { clinicId: 1, specialtyId: 2 }, // Clínica Saúde Plus - Dermatologia
      { clinicId: 1, specialtyId: 5 }, // Clínica Saúde Plus - Pediatria
      { clinicId: 2, specialtyId: 3 }, // Clínica Vida - Oftalmologia
      { clinicId: 2, specialtyId: 6 }, // Clínica Vida - Psicologia
      { clinicId: 3, specialtyId: 4 }, // Centro Médico - Odontologia
      { clinicId: 3, specialtyId: 7 }, // Centro Médico - Fisioterapia
      { clinicId: 3, specialtyId: 8 }, // Centro Médico - Nutrição
    ];

    await db
      .insert(clinicSpecialties)
      .values(clinicSpecialtiesData)
      .onDuplicateKeyUpdate({ set: { clinicId: 1 } });

    console.log(`✓ Associated specialties with clinics`);

    // Create sample ratings
    const ratingsData = [
      { clinicId: 1, userId: 4, score: 5 },
      { clinicId: 1, userId: 5, score: 4 },
      { clinicId: 2, userId: 4, score: 5 },
      { clinicId: 2, userId: 5, score: 5 },
      { clinicId: 3, userId: 6, score: 4 },
    ];

    await db
      .insert(ratings)
      .values(ratingsData)
      .onDuplicateKeyUpdate({ set: { score: 5 } });

    console.log(`✓ Created sample ratings`);

    // Create sample comments
    const commentsData = [
      {
        clinicId: 1,
        userId: 4,
        text: "Excelente atendimento! Recomendo muito.",
        isApproved: true,
      },
      {
        clinicId: 1,
        userId: 5,
        text: "Bom atendimento, mas poderia melhorar o tempo de espera.",
        isApproved: true,
      },
      {
        clinicId: 2,
        userId: 4,
        text: "Profissionais muito competentes e atenciosos.",
        isApproved: true,
      },
      {
        clinicId: 3,
        userId: 6,
        text: "Ambiente limpo e acolhedor. Voltaria com certeza!",
        isApproved: true,
      },
    ];

    await db
      .insert(comments)
      .values(commentsData)
      .onDuplicateKeyUpdate({ set: { text: "Updated comment" } });

    console.log(`✓ Created sample comments`);

    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

seed().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
