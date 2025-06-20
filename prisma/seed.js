const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const MASTER_DATA = {
  fasilitas: [
    // UMUM
    { nama_fasilitas: "WiFi", kategori: "UMUM", icon: "wifi" },
    { nama_fasilitas: "CCTV", kategori: "UMUM", icon: "camera" },
    { nama_fasilitas: "Dapur Bersama", kategori: "UMUM", icon: "chef" },
    { nama_fasilitas: "Ruang Tamu", kategori: "UMUM", icon: "sofa" },
    { nama_fasilitas: "Laundry", kategori: "UMUM", icon: "washing-machine" },
    { nama_fasilitas: "Security 24 Jam", kategori: "UMUM", icon: "shield" },
    { nama_fasilitas: "Lift", kategori: "UMUM", icon: "arrow-up" },

    // KAMAR
    { nama_fasilitas: "AC", kategori: "KAMAR", icon: "snowflake" },
    { nama_fasilitas: "Kasur", kategori: "KAMAR", icon: "bed" },
    { nama_fasilitas: "Lemari", kategori: "KAMAR", icon: "cabinet" },
    { nama_fasilitas: "Meja Belajar", kategori: "KAMAR", icon: "desk" },
    { nama_fasilitas: "Kursi", kategori: "KAMAR", icon: "chair" },
    { nama_fasilitas: "TV", kategori: "KAMAR", icon: "tv" },
    { nama_fasilitas: "Kipas Angin", kategori: "KAMAR", icon: "fan" },
    { nama_fasilitas: "Balkon", kategori: "KAMAR", icon: "door-open" },

    // KAMAR_MANDI
    { nama_fasilitas: "Kamar Mandi Dalam", kategori: "KAMAR_MANDI", icon: "bathroom" },
    { nama_fasilitas: "Water Heater", kategori: "KAMAR_MANDI", icon: "water-heater" },
    { nama_fasilitas: "Shower", kategori: "KAMAR_MANDI", icon: "shower" },
    { nama_fasilitas: "Toilet Duduk", kategori: "KAMAR_MANDI", icon: "toilet" },
    { nama_fasilitas: "Bathtub", kategori: "KAMAR_MANDI", icon: "bath" },

    // PARKIR
    { nama_fasilitas: "Parkir Motor", kategori: "PARKIR", icon: "motorcycle" },
    { nama_fasilitas: "Parkir Mobil", kategori: "PARKIR", icon: "car" },
    { nama_fasilitas: "Parkir Sepeda", kategori: "PARKIR", icon: "bicycle" },
  ],

  tipeKamar: [
    {
      nama_tipe: "Standard Single",
      ukuran: "3x4 meter",
      kapasitas: 1,
      deskripsi: "Kamar standar untuk 1 orang dengan fasilitas dasar"
    },
    {
      nama_tipe: "Premium Single",
      ukuran: "4x5 meter",
      kapasitas: 1,
      deskripsi: "Kamar premium untuk 1 orang dengan fasilitas lengkap"
    },
    {
      nama_tipe: "Deluxe Double",
      ukuran: "4x6 meter",
      kapasitas: 2,
      deskripsi: "Kamar deluxe untuk 2 orang dengan fasilitas premium"
    },
    {
      nama_tipe: "Family Room",
      ukuran: "5x7 meter",
      kapasitas: 4,
      deskripsi: "Kamar keluarga untuk 4 orang dengan ruang luas"
    }
  ],

  peraturan: [
    // KOST_UMUM
    { nama_peraturan: "Tidak boleh membawa tamu menginap", kategori: "KOST_UMUM", icon: "user-x" },
    { nama_peraturan: "Jam malam 22:00 WIB", kategori: "KOST_UMUM", icon: "clock" },
    { nama_peraturan: "Dilarang merokok di dalam kamar", kategori: "KOST_UMUM", icon: "no-smoking" },
    { nama_peraturan: "Wajib menjaga kebersihan", kategori: "KOST_UMUM", icon: "broom" },
    { nama_peraturan: "Dilarang membawa hewan peliharaan", kategori: "KOST_UMUM", icon: "pet-off" },
    { nama_peraturan: "Wajib lapor jika keluar lebih dari 3 hari", kategori: "KOST_UMUM", icon: "calendar" },
    { nama_peraturan: "Dilarang membuat keributan", kategori: "KOST_UMUM", icon: "volume-x" },
    { nama_peraturan: "Wajib menggunakan sepatu di area umum", kategori: "KOST_UMUM", icon: "shoe" },

    // TIPE_KAMAR
    { nama_peraturan: "Tidak boleh memasak di kamar", kategori: "TIPE_KAMAR", icon: "chef-off" },
    { nama_peraturan: "Wajib mematikan listrik saat keluar", kategori: "TIPE_KAMAR", icon: "power-off" },
    { nama_peraturan: "Maksimal kapasitas sesuai tipe kamar", kategori: "TIPE_KAMAR", icon: "users" },
    { nama_peraturan: "Dilarang menggunakan alat elektronik berlebihan", kategori: "TIPE_KAMAR", icon: "zap-off" },
    { nama_peraturan: "Wajib membersihkan kamar secara berkala", kategori: "TIPE_KAMAR", icon: "clean" },
  ],

  layananLaundry: [
    { nama_layanan: "Cuci Kering", satuan: "kg" },
    { nama_layanan: "Cuci Setrika", satuan: "kg" },
    { nama_layanan: "Setrika Saja", satuan: "pcs" },
    { nama_layanan: "Dry Clean", satuan: "pcs" },
    { nama_layanan: "Cuci Sepatu", satuan: "pcs" },
    { nama_layanan: "Cuci Selimut", satuan: "pcs" },
    { nama_layanan: "Cuci Boneka", satuan: "pcs" },
    { nama_layanan: "Express 6 Jam", satuan: "kg" },
  ],

  users: [
    {
      email: 'admin@kosan.com',
      username: 'admin',
      password: 'Admin123!',
      full_name: 'System Administrator',
      role: 'ADMIN',
      phone: '081234567890',
      is_approved: true,
      email_verified: true
    },
    {
      email: "pengelola1@gmail.com",
      username: "pengelola1",
      password: "Pengelola123!",
      full_name: "Budi Santoso",
      role: "PENGELOLA",
      phone: "081234567891",
      is_approved: true,
      email_verified: true
    },
    {
      email: "pengelola2@gmail.com",
      username: "pengelola2",
      password: "Pengelola123!",
      full_name: "Siti Rahayu",
      role: "PENGELOLA",
      phone: "081234567892",
      is_approved: true,
      email_verified: true
    },
    {
      email: "penghuni1@gmail.com",
      username: "penghuni1",
      password: "Penghuni123!",
      full_name: "Ahmad Fauzi",
      role: "PENGHUNI",
      phone: "081234567893",
      is_approved: true,
      email_verified: true
    }
  ]
};

async function createMasterData() {
  console.log("📝 Creating Master Data...");

  const results = {};

  // Create all master data
  results.fasilitas = await prisma.masterFasilitas.createMany({
    data: MASTER_DATA.fasilitas
  });

  results.tipeKamar = await prisma.masterTipeKamar.createMany({
    data: MASTER_DATA.tipeKamar
  });

  results.peraturan = await prisma.masterPeraturan.createMany({
    data: MASTER_DATA.peraturan
  });

  results.layananLaundry = await prisma.masterLayananLaundry.createMany({
    data: MASTER_DATA.layananLaundry
  });

  console.log(`✅ Created ${MASTER_DATA.fasilitas.length} fasilitas`);
  console.log(`✅ Created ${MASTER_DATA.tipeKamar.length} tipe kamar`);
  console.log(`✅ Created ${MASTER_DATA.peraturan.length} peraturan`);
  console.log(`✅ Created ${MASTER_DATA.layananLaundry.length} layanan laundry`);

  return results;
}

async function createUsers() {
  console.log("👥 Creating Users...");

  const users = [];
  for (const userData of MASTER_DATA.users) {
    const user = await prisma.users.create({
      data: {
        ...userData,
        password: await bcrypt.hash(userData.password, 12),
        whatsapp_number: userData.phone,
        has_manual_password: true
      }
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length} users`);
  return users;
}

async function createSampleKost(users) {
  console.log("🏠 Creating Sample Kost...");

  const tipeKamar = await prisma.masterTipeKamar.findMany();
  const pengelola = users.filter(u => u.role === 'PENGELOLA');

  const kostData = [
    {
      pengelola_id: pengelola[0].user_id,
      nama_kost: "Kost Merdeka Standard",
      alamat: "Jl. Merdeka Raya No. 123, Jakarta Pusat",
      total_kamar: 20,
      tipe_id: tipeKamar[0].tipe_id,
      harga_bulanan: 1500000,
      deposit: 1500000,
      harga_final: 1550000,
      is_approved: true
    },
    {
      pengelola_id: pengelola[1].user_id,
      nama_kost: "Kost Premium Sudirman",
      alamat: "Jl. Sudirman No. 456, Jakarta Selatan",
      total_kamar: 15,
      tipe_id: tipeKamar[1].tipe_id,
      harga_bulanan: 3000000,
      deposit: 3000000,
      harga_final: 3075000,
      is_approved: true
    }
  ];

  const kosts = [];
  for (const data of kostData) {
    const kost = await prisma.kost.create({ data });
    kosts.push(kost);
  }

  console.log(`✅ Created ${kosts.length} kost`);
  return kosts;
}

async function linkKostFasilitas(kosts) {
  console.log("🔗 Linking Kost Fasilitas...");

  const fasilitas = await prisma.masterFasilitas.findMany();
  const basicFasilitas = fasilitas.slice(0, 8); // First 8 facilities

  for (const kost of kosts) {
    await prisma.kostFasilitas.createMany({
      data: basicFasilitas.map(f => ({
        kost_id: kost.kost_id,
        fasilitas_id: f.fasilitas_id
      }))
    });
  }

  console.log("✅ Linked fasilitas to kost");
}

async function linkKostPeraturan(kosts) {
  console.log("📋 Linking Kost Peraturan...");

  const peraturan = await prisma.masterPeraturan.findMany();
  const basicPeraturan = peraturan.slice(0, 5); // First 5 rules

  for (const kost of kosts) {
    await prisma.kostPeraturan.createMany({
      data: basicPeraturan.map(p => ({
        kost_id: kost.kost_id,
        peraturan_id: p.peraturan_id
      }))
    });
  }

  console.log("✅ Linked peraturan to kost");
}

async function createSampleReservasi(users, kosts) {
  console.log("📝 Creating Sample Reservasi...");

  const penghuni = users.filter(u => u.role === 'PENGHUNI');
  const admin = users.find(u => u.role === 'ADMIN');

  const checkInDate = new Date();
  checkInDate.setMonth(checkInDate.getMonth() - 1);

  const reservasi = await prisma.reservasi.create({
    data: {
      user_id: penghuni[0].user_id,
      kost_id: kosts[0].kost_id,
      tanggal_check_in: checkInDate,
      durasi_bulan: 6,
      total_harga: kosts[0].harga_bulanan * 6,
      status: "APPROVED",
      metode_bayar: "TRANSFER",
      validated_by: admin.user_id,
      validated_at: checkInDate,
      deposit_amount: kosts[0].deposit,
      status_penghunian: "AKTIF"
    }
  });

  console.log("✅ Created sample reservasi");
  return reservasi;
}

async function main() {
  console.log("🌱 Starting efficient database seeding...");

  try {
    await createMasterData();

    const users = await createUsers();

    const kosts = await createSampleKost(users);

    await linkKostFasilitas(kosts);
    await linkKostPeraturan(kosts);

    await createSampleReservasi(users, kosts);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   👥 Users: ${MASTER_DATA.users.length}`);
    console.log(`   🏠 Kost: ${kosts.length}`);
    console.log(`   📋 Master Fasilitas: ${MASTER_DATA.fasilitas.length}`);
    console.log(`   📋 Master Tipe Kamar: ${MASTER_DATA.tipeKamar.length}`);
    console.log(`   📋 Master Peraturan: ${MASTER_DATA.peraturan.length}`);
    console.log(`   📋 Master Layanan Laundry: ${MASTER_DATA.layananLaundry.length}`);

    console.log("\n🔑 Login Credentials:");
    console.log("   Admin: admin@kosan.com / Admin123!");
    console.log("   Pengelola 1: pengelola1@gmail.com / Pengelola123!");
    console.log("   Penghuni 1: penghuni1@gmail.com / Penghuni123!");

  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});