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
    { nama_fasilitas: "Area Jemuran", kategori: "UMUM", icon: "sun" },
    { nama_fasilitas: "Mushola", kategori: "UMUM", icon: "mosque" },
    { nama_fasilitas: "Kantin", kategori: "UMUM", icon: "utensils" },

    // KAMAR
    { nama_fasilitas: "AC", kategori: "KAMAR", icon: "snowflake" },
    { nama_fasilitas: "Kasur", kategori: "KAMAR", icon: "bed" },
    { nama_fasilitas: "Lemari", kategori: "KAMAR", icon: "cabinet" },
    { nama_fasilitas: "Meja Belajar", kategori: "KAMAR", icon: "desk" },
    { nama_fasilitas: "Kursi", kategori: "KAMAR", icon: "chair" },
    { nama_fasilitas: "TV", kategori: "KAMAR", icon: "tv" },
    { nama_fasilitas: "Kipas Angin", kategori: "KAMAR", icon: "fan" },
    { nama_fasilitas: "Balkon", kategori: "KAMAR", icon: "door-open" },
    { nama_fasilitas: "Jendela Besar", kategori: "KAMAR", icon: "window" },
    { nama_fasilitas: "Cermin", kategori: "KAMAR", icon: "mirror" },

    // KAMAR_MANDI
    { nama_fasilitas: "Kamar Mandi Dalam", kategori: "KAMAR_MANDI", icon: "bathroom" },
    { nama_fasilitas: "Water Heater", kategori: "KAMAR_MANDI", icon: "water-heater" },
    { nama_fasilitas: "Shower", kategori: "KAMAR_MANDI", icon: "shower" },
    { nama_fasilitas: "Toilet Duduk", kategori: "KAMAR_MANDI", icon: "toilet" },
    { nama_fasilitas: "Bathtub", kategori: "KAMAR_MANDI", icon: "bath" },
    { nama_fasilitas: "Wastafel", kategori: "KAMAR_MANDI", icon: "sink" },
    { nama_fasilitas: "Exhaust Fan", kategori: "KAMAR_MANDI", icon: "fan" },

    // PARKIR
    { nama_fasilitas: "Parkir Motor", kategori: "PARKIR", icon: "motorcycle" },
    { nama_fasilitas: "Parkir Mobil", kategori: "PARKIR", icon: "car" },
    { nama_fasilitas: "Parkir Sepeda", kategori: "PARKIR", icon: "bicycle" },
    { nama_fasilitas: "Parkir Covered", kategori: "PARKIR", icon: "garage" },
  ],

  tipeKamar: [
    {
      nama_tipe: "Standard Single",
      ukuran: "3x4 meter",
      kapasitas: 1,
      deskripsi: "Kamar standar untuk 1 orang dengan fasilitas dasar seperti kasur, lemari, dan meja belajar"
    },
    {
      nama_tipe: "Premium Single",
      ukuran: "4x5 meter",
      kapasitas: 1,
      deskripsi: "Kamar premium untuk 1 orang dengan fasilitas lengkap termasuk AC, TV, dan kamar mandi dalam"
    },
    {
      nama_tipe: "Deluxe Double",
      ukuran: "4x6 meter",
      kapasitas: 2,
      deskripsi: "Kamar deluxe untuk 2 orang dengan fasilitas premium dan area yang lebih luas"
    },
    {
      nama_tipe: "Family Room",
      ukuran: "5x7 meter",
      kapasitas: 4,
      deskripsi: "Kamar keluarga untuk 4 orang dengan ruang luas dan fasilitas lengkap"
    },
    {
      nama_tipe: "Studio Apartment",
      ukuran: "6x8 meter",
      kapasitas: 2,
      deskripsi: "Studio apartment dengan dapur kecil dan area living yang terpisah"
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
    { nama_peraturan: "Parkir sesuai dengan tempat yang disediakan", kategori: "KOST_UMUM", icon: "parking" },
    { nama_peraturan: "Dilarang membawa alkohol", kategori: "KOST_UMUM", icon: "wine-off" },

    // TIPE_KAMAR
    { nama_peraturan: "Tidak boleh memasak di kamar", kategori: "TIPE_KAMAR", icon: "chef-off" },
    { nama_peraturan: "Wajib mematikan listrik saat keluar", kategori: "TIPE_KAMAR", icon: "power-off" },
    { nama_peraturan: "Maksimal kapasitas sesuai tipe kamar", kategori: "TIPE_KAMAR", icon: "users" },
    { nama_peraturan: "Dilarang menggunakan alat elektronik berlebihan", kategori: "TIPE_KAMAR", icon: "zap-off" },
    { nama_peraturan: "Wajib membersihkan kamar secara berkala", kategori: "TIPE_KAMAR", icon: "clean" },
    { nama_peraturan: "Dilarang mengganti kunci kamar", kategori: "TIPE_KAMAR", icon: "key-off" },
    { nama_peraturan: "Wajib melaporkan kerusakan fasilitas", kategori: "TIPE_KAMAR", icon: "tools" },
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
    { nama_layanan: "Cuci Karpet", satuan: "pcs" },
    { nama_layanan: "Cuci Tas", satuan: "pcs" },
  ],

  users: [
    {
      email: "admin@kosan.com",
      username: "admin",
      password: "Admin123!",
      full_name: "System Administrator",
      role: "ADMIN",
      phone: "081234567890",
      is_approved: true,
      email_verified: true,
    },
    {
      email: "pengelola1@gmail.com",
      username: "pengelola1",
      password: "Pengelola123!",
      full_name: "Budi Santoso",
      role: "PENGELOLA",
      phone: "081234567891",
      is_approved: true,
      email_verified: true,
    },
    {
      email: "pengelola2@gmail.com",
      username: "pengelola2",
      password: "Pengelola123!",
      full_name: "Siti Rahayu",
      role: "PENGELOLA",
      phone: "081234567892",
      is_approved: true,
      email_verified: true,
    },
    {
      email: "penghuni1@gmail.com",
      username: "penghuni1",
      password: "Penghuni123!",
      full_name: "Ahmad Fauzi",
      role: "PENGHUNI",
      phone: "081234567893",
      is_approved: true,
      email_verified: true,
    },
    {
      email: "penghuni2@gmail.com",
      username: "penghuni2",
      password: "Penghuni123!",
      full_name: "Maya Sari",
      role: "PENGHUNI",
      phone: "081234567894",
      is_approved: true,
      email_verified: true,
    }
  ],

  catering: [
    {
      nama_catering: "Warung Bu Tini",
      alamat: "Jl. Merdeka Raya No. 125, Jakarta Pusat",
      whatsapp_number: "081234567896",
      is_partner: true,
      is_active: true,
    },
    {
      nama_catering: "Dapur Sehat Mama",
      alamat: "Jl. Sudirman No. 458, Jakarta Selatan",
      whatsapp_number: "081234567897",
      is_partner: false,
      is_active: true,
    },
  ],

  cateringMenus: [
    [
      { nama_menu: "Nasi Gudeg", kategori: "MAKANAN_BERAT", harga: 15000 },
      { nama_menu: "Nasi Ayam Bakar", kategori: "MAKANAN_BERAT", harga: 18000 },
      { nama_menu: "Gado-gado", kategori: "MAKANAN_BERAT", harga: 12000 },
      { nama_menu: "Soto Ayam", kategori: "MAKANAN_BERAT", harga: 14000 },
      { nama_menu: "Es Teh Manis", kategori: "MINUMAN", harga: 5000 },
      { nama_menu: "Es Jeruk", kategori: "MINUMAN", harga: 6000 },
      { nama_menu: "Kerupuk", kategori: "SNACK", harga: 3000 },
      { nama_menu: "Gorengan", kategori: "SNACK", harga: 5000 },
    ],
    [
      { nama_menu: "Salmon Bowl", kategori: "MAKANAN_BERAT", harga: 25000 },
      { nama_menu: "Caesar Salad", kategori: "MAKANAN_BERAT", harga: 20000 },
      { nama_menu: "Chicken Teriyaki", kategori: "MAKANAN_BERAT", harga: 22000 },
      { nama_menu: "Smoothie Bowl", kategori: "SNACK", harga: 15000 },
      { nama_menu: "Orange Juice", kategori: "MINUMAN", harga: 8000 },
      { nama_menu: "Green Tea Latte", kategori: "MINUMAN", harga: 10000 },
      { nama_menu: "Fruit Salad", kategori: "SNACK", harga: 12000 },
    ],
  ],

  laundry: [
    {
      nama_laundry: "Laundry Express 24",
      alamat: "Jl. Merdeka Raya No. 127, Jakarta Pusat",
      whatsapp_number: "081234567898",
      is_partner: true,
      is_active: true,
    },
    {
      nama_laundry: "Premium Clean",
      alamat: "Jl. Sudirman No. 460, Jakarta Selatan",
      whatsapp_number: "081234567899",
      is_partner: false,
      is_active: true,
    },
  ],

  laundryHarga: [
    [
      { layanan_index: 0, harga: 8000 },   // Cuci Kering
      { layanan_index: 1, harga: 12000 },  // Cuci Setrika
      { layanan_index: 2, harga: 5000 },   // Setrika Saja
      { layanan_index: 4, harga: 15000 },  // Cuci Sepatu
      { layanan_index: 7, harga: 20000 },  // Express 6 Jam
    ],
    [
      { layanan_index: 0, harga: 12000 },  // Cuci Kering
      { layanan_index: 1, harga: 18000 },  // Cuci Setrika
      { layanan_index: 3, harga: 25000 },  // Dry Clean
      { layanan_index: 5, harga: 20000 },  // Cuci Selimut
      { layanan_index: 8, harga: 30000 },  // Cuci Karpet
    ],
  ],
};

async function createMasterData() {
  console.log("📝 Creating Master Data...");

  await prisma.masterFasilitas.createMany({ data: MASTER_DATA.fasilitas });
  await prisma.masterTipeKamar.createMany({ data: MASTER_DATA.tipeKamar });
  await prisma.masterPeraturan.createMany({ data: MASTER_DATA.peraturan });
  await prisma.masterLayananLaundry.createMany({ data: MASTER_DATA.layananLaundry });

  console.log(`✅ Created ${MASTER_DATA.fasilitas.length} fasilitas`);
  console.log(`✅ Created ${MASTER_DATA.tipeKamar.length} tipe kamar`);
  console.log(`✅ Created ${MASTER_DATA.peraturan.length} peraturan`);
  console.log(`✅ Created ${MASTER_DATA.layananLaundry.length} layanan laundry`);
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
        has_manual_password: true,
        is_guest: false,
        google_id: null,
        avatar: null,
        last_login: null,
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
  const pengelola = users.filter(u => u.role === "PENGELOLA");

  const kostData = [
    {
      pengelola_id: pengelola[0].user_id,
      nama_kost: "Kost Merdeka Standard",
      alamat: "Jl. Merdeka Raya No. 123, Menteng, Jakarta Pusat, DKI Jakarta 10310",
      gmaps_link: "https://goo.gl/maps/example1",
      deskripsi: "Kost nyaman dan strategis di pusat kota Jakarta dengan fasilitas lengkap dan keamanan 24 jam",
      total_kamar: 20,
      daya_listrik: "1300 VA",
      sumber_air: "PDAM",
      wifi_speed: "50 Mbps",
      kapasitas_parkir_motor: 15,
      kapasitas_parkir_mobil: 5,
      kapasitas_parkir_sepeda: 10,
      biaya_tambahan: 50000,
      jam_survey: "08:00 - 21:00 WIB",
      foto_kost: [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
      ],
      qris_image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
      rekening_info: {
        bank: "BCA",
        nomor: "1234567890",
        atas_nama: "Budi Santoso"
      },
      tipe_id: tipeKamar[0].tipe_id,
      harga_bulanan: 1500000,
      deposit: 1500000,
      harga_final: 1550000,
      is_approved: true,
    },
    {
      pengelola_id: pengelola[1].user_id,
      nama_kost: "Kost Premium Sudirman",
      alamat: "Jl. Sudirman No. 456, Setiabudi, Jakarta Selatan, DKI Jakarta 12920",
      gmaps_link: "https://goo.gl/maps/example2",
      deskripsi: "Kost eksklusif dengan pemandangan kota Jakarta dan fasilitas premium seperti hotel",
      total_kamar: 15,
      daya_listrik: "2200 VA",
      sumber_air: "PDAM + Filter",
      wifi_speed: "100 Mbps",
      kapasitas_parkir_motor: 25,
      kapasitas_parkir_mobil: 10,
      kapasitas_parkir_sepeda: 15,
      biaya_tambahan: 75000,
      jam_survey: "07:00 - 22:00 WIB",
      foto_kost: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
      ],
      qris_image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
      rekening_info: {
        bank: "Mandiri",
        nomor: "0987654321",
        atas_nama: "Siti Rahayu"
      },
      tipe_id: tipeKamar[1].tipe_id,
      harga_bulanan: 3000000,
      deposit: 3000000,
      harga_final: 3075000,
      is_approved: true,
    },
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

  // Kost 1 - Standard facilities
  const kost1FasilitasIds = fasilitas.slice(0, 10).map(f => f.fasilitas_id);
  await prisma.kostFasilitas.createMany({
    data: kost1FasilitasIds.map(fasilitas_id => ({
      kost_id: kosts[0].kost_id,
      fasilitas_id
    }))
  });

  // Kost 2 - Premium facilities (more facilities)
  const kost2FasilitasIds = fasilitas.slice(0, 15).map(f => f.fasilitas_id);
  await prisma.kostFasilitas.createMany({
    data: kost2FasilitasIds.map(fasilitas_id => ({
      kost_id: kosts[1].kost_id,
      fasilitas_id
    }))
  });

  console.log("✅ Linked fasilitas to kost");
}

async function linkKostPeraturan(kosts) {
  console.log("📋 Linking Kost Peraturan...");

  const peraturan = await prisma.masterPeraturan.findMany();

  // Basic rules for both kost
  const basicPeraturanIds = peraturan.slice(0, 8).map(p => p.peraturan_id);

  for (const kost of kosts) {
    await prisma.kostPeraturan.createMany({
      data: basicPeraturanIds.map(peraturan_id => ({
        kost_id: kost.kost_id,
        peraturan_id,
        keterangan_tambahan: null
      }))
    });
  }

  console.log("✅ Linked peraturan to kost");
}

async function createSampleReservasi(users, kosts) {
  console.log("📝 Creating Sample Reservasi...");

  const penghuni = users.filter(u => u.role === "PENGHUNI");
  const admin = users.find(u => u.role === "ADMIN");

  // Helper function to calculate checkout date
  const calculateCheckOutDate = (checkInDate, durasiBulan) => {
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setMonth(checkOutDate.getMonth() + durasiBulan);
    return checkOutDate;
  };

  // Reservasi 1 - Active contract
  const checkInDate1 = new Date();
  checkInDate1.setMonth(checkInDate1.getMonth() - 2);
  const durasi1 = 12;
  const checkOutDate1 = calculateCheckOutDate(checkInDate1, durasi1);

  const reservasi1 = await prisma.reservasi.create({
    data: {
      user_id: penghuni[0].user_id,
      kost_id: kosts[0].kost_id,
      tanggal_check_in: checkInDate1,
      tanggal_keluar: checkOutDate1,
      durasi_bulan: durasi1,
      total_harga: kosts[0].harga_bulanan * durasi1,
      bukti_bayar: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
      status: "APPROVED",
      metode_bayar: "TRANSFER",
      catatan: "Kontrak tahunan",
      rejection_reason: null,
      validated_by: admin.user_id,
      validated_at: checkInDate1,
      deposit_amount: kosts[0].deposit,
      status_penghunian: "AKTIF",
    }
  });

  // Reservasi 2 - Expired contract
  const checkInDate2 = new Date();
  checkInDate2.setMonth(checkInDate2.getMonth() - 8);
  const durasi2 = 6;
  const checkOutDate2 = calculateCheckOutDate(checkInDate2, durasi2);

  const reservasi2 = await prisma.reservasi.create({
    data: {
      user_id: penghuni[1].user_id,
      kost_id: kosts[1].kost_id,
      tanggal_check_in: checkInDate2,
      tanggal_keluar: checkOutDate2,
      durasi_bulan: durasi2,
      total_harga: kosts[1].harga_bulanan * durasi2,
      bukti_bayar: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
      status: "APPROVED",
      metode_bayar: "QRIS",
      catatan: "Kontrak semester",
      rejection_reason: null,
      validated_by: admin.user_id,
      validated_at: checkInDate2,
      deposit_amount: kosts[1].deposit,
      status_penghunian: "KELUAR",
    }
  });

  // Reservasi 3 - Pending approval
  const checkInDate3 = new Date();
  checkInDate3.setDate(checkInDate3.getDate() + 7);
  const durasi3 = 3;
  const checkOutDate3 = calculateCheckOutDate(checkInDate3, durasi3);

  const reservasi3 = await prisma.reservasi.create({
    data: {
      user_id: penghuni[0].user_id,
      kost_id: kosts[0].kost_id,
      tanggal_check_in: checkInDate3,
      tanggal_keluar: checkOutDate3,
      durasi_bulan: durasi3,
      total_harga: kosts[0].harga_bulanan * durasi3,
      bukti_bayar: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
      status: "PENDING",
      metode_bayar: "TRANSFER",
      catatan: "Mohon segera diproses",
      rejection_reason: null,
      validated_by: null,
      validated_at: null,
      deposit_amount: kosts[0].deposit,
      status_penghunian: null,
    }
  });

  console.log("✅ Created 3 sample reservasi (1 aktif, 1 keluar, 1 pending)");
  return [reservasi1, reservasi2, reservasi3];
}

async function createCateringServices(kosts) {
  console.log("🍽️ Creating Catering Services...");

  const caterings = [];
  for (let i = 0; i < MASTER_DATA.catering.length; i++) {
    const cateringData = {
      ...MASTER_DATA.catering[i],
      kost_id: kosts[i].kost_id,
      qris_image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
      rekening_info: {
        bank: i === 0 ? "BRI" : "BCA",
        nomor: i === 0 ? "1111222233334444" : "5555666677778888",
        atas_nama: MASTER_DATA.catering[i].nama_catering
      }
    };

    const catering = await prisma.catering.create({ data: cateringData });
    caterings.push(catering);
  }

  console.log(`✅ Created ${caterings.length} catering services`);
  return caterings;
}

async function createCateringMenus(caterings) {
  console.log("📋 Creating Catering Menus...");

  let totalMenus = 0;
  for (let i = 0; i < caterings.length; i++) {
    const menuData = MASTER_DATA.cateringMenus[i].map(menu => ({
      ...menu,
      catering_id: caterings[i].catering_id,
      foto_menu: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
      is_available: true
    }));

    await prisma.cateringMenu.createMany({ data: menuData });
    totalMenus += menuData.length;
  }

  console.log(`✅ Created ${totalMenus} catering menu items`);
}

async function createLaundryServices(kosts) {
  console.log("🧺 Creating Laundry Services...");

  const laundries = [];
  for (let i = 0; i < MASTER_DATA.laundry.length; i++) {
    const laundryData = {
      ...MASTER_DATA.laundry[i],
      kost_id: kosts[i].kost_id,
      qris_image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
      rekening_info: {
        bank: i === 0 ? "Mandiri" : "BCA",
        nomor: i === 0 ? "9999888877776666" : "3333444455556666",
        atas_nama: MASTER_DATA.laundry[i].nama_laundry
      }
    };

    const laundry = await prisma.laundry.create({ data: laundryData });
    laundries.push(laundry);
  }

  console.log(`✅ Created ${laundries.length} laundry services`);
  return laundries;
}

async function createLaundryPricing(laundries) {
  console.log("💰 Creating Laundry Pricing...");

  const layananLaundry = await prisma.masterLayananLaundry.findMany();
  let totalPricing = 0;

  for (let i = 0; i < laundries.length; i++) {
    const pricingData = MASTER_DATA.laundryHarga[i].map(pricing => ({
      laundry_id: laundries[i].laundry_id,
      layanan_id: layananLaundry[pricing.layanan_index].layanan_id,
      harga_per_satuan: pricing.harga,
      is_available: true
    }));

    await prisma.laundryHarga.createMany({ data: pricingData });
    totalPricing += pricingData.length;
  }

  console.log(`✅ Created ${totalPricing} laundry pricing items`);
}

async function createSampleOrders(users, reservasiList) {
  console.log("📦 Creating Sample Orders...");

  const penghuni = users.filter(u => u.role === "PENGHUNI");
  const admin = users.find(u => u.role === "ADMIN");

  // Get active reservation
  const activeReservasi = reservasiList.find(r => r.status === "APPROVED" && r.status_penghunian === "AKTIF");

  if (!activeReservasi) {
    console.log("⚠️ No active reservation found, skipping orders");
    return;
  }

  // Sample Catering Order - linked to reservation
  const cateringMenus = await prisma.cateringMenu.findMany({
    take: 2,
    orderBy: { harga: 'asc' },
    where: {
      catering: {
        kost_id: activeReservasi.kost_id
      }
    }
  });

  if (cateringMenus.length > 0) {
    const totalCateringHarga = cateringMenus.reduce((sum, menu) => sum + menu.harga, 0);

    if (totalCateringHarga <= 99999) {
      const pesananCatering = await prisma.pesananCatering.create({
        data: {
          user_id: activeReservasi.user_id,
          reservasi_id: activeReservasi.reservasi_id, // Link to reservation
          total_harga: totalCateringHarga,
          status: "DITERIMA",
          catatan: `Pesanan dalam periode kontrak (${activeReservasi.tanggal_check_in.toDateString()} - ${activeReservasi.tanggal_keluar.toDateString()})`,
          detail_pesanan: {
            create: cateringMenus.map(menu => ({
              menu_id: menu.menu_id,
              jumlah_porsi: 1,
              harga_satuan: menu.harga
            }))
          }
        }
      });

      await prisma.pembayaranCatering.create({
        data: {
          pesanan_id: pesananCatering.pesanan_id,
          jumlah: totalCateringHarga,
          metode: "QRIS",
          bukti_bayar: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
          status: "VERIFIED",
          verified_by: admin.user_id,
          verified_at: new Date(),
          catatan: "Pembayaran via QRIS berhasil diverifikasi"
        }
      });

      console.log(`✅ Created catering order for reservation ${activeReservasi.reservasi_id}`);
    }
  }

  // Sample Laundry Order - linked to reservation
  const laundryHarga = await prisma.laundryHarga.findMany({
    take: 2,
    orderBy: { harga_per_satuan: 'asc' },
    where: {
      laundry: {
        kost_id: activeReservasi.kost_id
      }
    }
  });

  if (laundryHarga.length > 0) {
    const totalLaundryHarga = laundryHarga.reduce((sum, harga) => sum + (harga.harga_per_satuan * 2), 0);

    if (totalLaundryHarga <= 99999) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const pesananLaundry = await prisma.pesananLaundry.create({
        data: {
          user_id: activeReservasi.user_id,
          laundry_id: laundryHarga[0].laundry_id,
          reservasi_id: activeReservasi.reservasi_id, // Link to reservation
          total_estimasi: totalLaundryHarga,
          total_final: totalLaundryHarga,
          berat_actual: 3.0,
          tanggal_antar: new Date(),
          estimasi_selesai: dayAfterTomorrow,
          status: "PROSES",
          catatan: `Laundry dalam periode kontrak (${activeReservasi.tanggal_check_in.toDateString()} - ${activeReservasi.tanggal_keluar.toDateString()})`,
          detail_pesanan_laundry: {
            create: laundryHarga.map(harga => ({
              layanan_id: harga.layanan_id,
              jumlah_satuan: 2,
              harga_per_satuan: harga.harga_per_satuan
            }))
          }
        }
      });

      await prisma.pembayaranLaundry.create({
        data: {
          pesanan_id: pesananLaundry.pesanan_id,
          jumlah: totalLaundryHarga,
          metode: "TRANSFER",
          bukti_bayar: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
          status: "VERIFIED",
          verified_by: admin.user_id,
          verified_at: new Date(),
          catatan: "Pembayaran via transfer berhasil diverifikasi"
        }
      });

      console.log(`✅ Created laundry order for reservation ${activeReservasi.reservasi_id}`);
    }
  }

  console.log("✅ All orders created within valid contract periods");
}

async function main() {
  console.log("🌱 Starting comprehensive database seeding...");

  try {
    // Create all master data
    await createMasterData();

    // Create users
    const users = await createUsers();

    // Create sample kost
    const kosts = await createSampleKost(users);

    // Link relationships
    await linkKostFasilitas(kosts);
    await linkKostPeraturan(kosts);

    // Create sample reservasi
    const reservasiList = await createSampleReservasi(users, kosts);

    // Create catering services
    const caterings = await createCateringServices(kosts);
    await createCateringMenus(caterings);

    // Create laundry services  
    const laundries = await createLaundryServices(kosts);
    await createLaundryPricing(laundries);

    // Create sample orders linked to reservations
    await createSampleOrders(users, reservasiList);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   👥 Users: ${MASTER_DATA.users.length} (1 Admin, 2 Pengelola, 2 Penghuni)`);
    console.log(`   🏠 Kost: ${kosts.length} with complete details`);
    console.log(`   📝 Reservasi: ${reservasiList.length} (1 aktif, 1 keluar, 1 pending)`);
    console.log(`   🍽️ Catering: ${caterings.length} with comprehensive menus`);
    console.log(`   🧺 Laundry: ${laundries.length} with pricing`);
    console.log(`   📋 Master Fasilitas: ${MASTER_DATA.fasilitas.length} (complete categories)`);
    console.log(`   📋 Master Tipe Kamar: ${MASTER_DATA.tipeKamar.length} (including studio)`);
    console.log(`   📋 Master Peraturan: ${MASTER_DATA.peraturan.length} (complete rules)`);
    console.log(`   📋 Master Layanan Laundry: ${MASTER_DATA.layananLaundry.length} (complete services)`);
    console.log(`   📦 Sample orders: Catering & Laundry linked to reservations with payments`);

    console.log("\n🔑 Login Credentials:");
    console.log("   Admin: admin@kosan.com / Admin123!");
    console.log("   Pengelola 1: pengelola1@gmail.com / Pengelola123!");
    console.log("   Pengelola 2: pengelola2@gmail.com / Pengelola123!");
    console.log("   Penghuni 1: penghuni1@gmail.com / Penghuni123!");
    console.log("   Penghuni 2: penghuni2@gmail.com / Penghuni123!");

    console.log("\n📈 Key Features:");
    console.log("   ✅ Complete master data for all categories");
    console.log("   ✅ Reservasi with proper contract periods (tanggal_check_in & tanggal_keluar)");
    console.log("   ✅ Orders linked to reservations via reservasi_id");
    console.log("   ✅ All required fields populated according to schema");
    console.log("   ✅ Realistic data relationships and constraints");

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