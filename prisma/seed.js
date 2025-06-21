const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const MASTER_DATA = {
  fasilitas: [
    { nama_fasilitas: "WiFi", kategori: "UMUM", icon: "wifi" },
    { nama_fasilitas: "CCTV", kategori: "UMUM", icon: "camera" },
    { nama_fasilitas: "Dapur Bersama", kategori: "UMUM", icon: "chef" },
    { nama_fasilitas: "Ruang Tamu", kategori: "UMUM", icon: "sofa" },
    { nama_fasilitas: "Laundry", kategori: "UMUM", icon: "washing-machine" },
    { nama_fasilitas: "Security 24 Jam", kategori: "UMUM", icon: "shield" },
    { nama_fasilitas: "Lift", kategori: "UMUM", icon: "arrow-up" },
    { nama_fasilitas: "AC", kategori: "KAMAR", icon: "snowflake" },
    { nama_fasilitas: "Kasur", kategori: "KAMAR", icon: "bed" },
    { nama_fasilitas: "Lemari", kategori: "KAMAR", icon: "cabinet" },
    { nama_fasilitas: "Meja Belajar", kategori: "KAMAR", icon: "desk" },
    { nama_fasilitas: "Kursi", kategori: "KAMAR", icon: "chair" },
    { nama_fasilitas: "TV", kategori: "KAMAR", icon: "tv" },
    { nama_fasilitas: "Kipas Angin", kategori: "KAMAR", icon: "fan" },
    { nama_fasilitas: "Balkon", kategori: "KAMAR", icon: "door-open" },
    {
      nama_fasilitas: "Kamar Mandi Dalam",
      kategori: "KAMAR_MANDI",
      icon: "bathroom",
    },
    {
      nama_fasilitas: "Water Heater",
      kategori: "KAMAR_MANDI",
      icon: "water-heater",
    },
    { nama_fasilitas: "Shower", kategori: "KAMAR_MANDI", icon: "shower" },
    { nama_fasilitas: "Toilet Duduk", kategori: "KAMAR_MANDI", icon: "toilet" },
    { nama_fasilitas: "Bathtub", kategori: "KAMAR_MANDI", icon: "bath" },
    { nama_fasilitas: "Parkir Motor", kategori: "PARKIR", icon: "motorcycle" },
    { nama_fasilitas: "Parkir Mobil", kategori: "PARKIR", icon: "car" },
    { nama_fasilitas: "Parkir Sepeda", kategori: "PARKIR", icon: "bicycle" },
  ],
  tipeKamar: [
    {
      nama_tipe: "Standard Single",
      ukuran: "3x4 meter",
      kapasitas: 1,
      deskripsi: "Kamar standar untuk 1 orang dengan fasilitas dasar",
    },
    {
      nama_tipe: "Premium Single",
      ukuran: "4x5 meter",
      kapasitas: 1,
      deskripsi: "Kamar premium untuk 1 orang dengan fasilitas lengkap",
    },
    {
      nama_tipe: "Deluxe Double",
      ukuran: "4x6 meter",
      kapasitas: 2,
      deskripsi: "Kamar deluxe untuk 2 orang dengan fasilitas premium",
    },
    {
      nama_tipe: "Family Room",
      ukuran: "5x7 meter",
      kapasitas: 4,
      deskripsi: "Kamar keluarga untuk 4 orang dengan ruang luas",
    },
  ],
  peraturan: [
    {
      nama_peraturan: "Tidak boleh membawa tamu menginap",
      kategori: "KOST_UMUM",
      icon: "user-x",
    },
    {
      nama_peraturan: "Jam malam 22:00 WIB",
      kategori: "KOST_UMUM",
      icon: "clock",
    },
    {
      nama_peraturan: "Dilarang merokok di dalam kamar",
      kategori: "KOST_UMUM",
      icon: "no-smoking",
    },
    {
      nama_peraturan: "Wajib menjaga kebersihan",
      kategori: "KOST_UMUM",
      icon: "broom",
    },
    {
      nama_peraturan: "Dilarang membawa hewan peliharaan",
      kategori: "KOST_UMUM",
      icon: "pet-off",
    },
    {
      nama_peraturan: "Wajib lapor jika keluar lebih dari 3 hari",
      kategori: "KOST_UMUM",
      icon: "calendar",
    },
    {
      nama_peraturan: "Dilarang membuat keributan",
      kategori: "KOST_UMUM",
      icon: "volume-x",
    },
    {
      nama_peraturan: "Wajib menggunakan sepatu di area umum",
      kategori: "KOST_UMUM",
      icon: "shoe",
    },
    {
      nama_peraturan: "Tidak boleh memasak di kamar",
      kategori: "TIPE_KAMAR",
      icon: "chef-off",
    },
    {
      nama_peraturan: "Wajib mematikan listrik saat keluar",
      kategori: "TIPE_KAMAR",
      icon: "power-off",
    },
    {
      nama_peraturan: "Maksimal kapasitas sesuai tipe kamar",
      kategori: "TIPE_KAMAR",
      icon: "users",
    },
    {
      nama_peraturan: "Dilarang menggunakan alat elektronik berlebihan",
      kategori: "TIPE_KAMAR",
      icon: "zap-off",
    },
    {
      nama_peraturan: "Wajib membersihkan kamar secara berkala",
      kategori: "TIPE_KAMAR",
      icon: "clean",
    },
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
      { nama_menu: "Es Teh Manis", kategori: "MINUMAN", harga: 5000 },
      { nama_menu: "Kerupuk", kategori: "SNACK", harga: 3000 },
    ],
    [
      { nama_menu: "Salmon Bowl", kategori: "MAKANAN_BERAT", harga: 25000 },
      { nama_menu: "Caesar Salad", kategori: "MAKANAN_BERAT", harga: 20000 },
      { nama_menu: "Smoothie Bowl", kategori: "SNACK", harga: 15000 },
      { nama_menu: "Orange Juice", kategori: "MINUMAN", harga: 8000 },
      { nama_menu: "Green Tea Latte", kategori: "MINUMAN", harga: 10000 },
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
      { layanan_index: 0, harga: 8000 },
      { layanan_index: 1, harga: 12000 },
      { layanan_index: 2, harga: 5000 },
      { layanan_index: 4, harga: 15000 },
    ],
    [
      { layanan_index: 0, harga: 12000 },
      { layanan_index: 1, harga: 18000 },
      { layanan_index: 3, harga: 25000 },
      { layanan_index: 5, harga: 20000 },
    ],
  ],
};

async function createMasterData() {
  console.log("📝 Creating Master Data...");
  await prisma.masterFasilitas.createMany({ data: MASTER_DATA.fasilitas });
  await prisma.masterTipeKamar.createMany({ data: MASTER_DATA.tipeKamar });
  await prisma.masterPeraturan.createMany({ data: MASTER_DATA.peraturan });
  await prisma.masterLayananLaundry.createMany({
    data: MASTER_DATA.layananLaundry,
  });
  console.log(
    `✅ Created ${MASTER_DATA.fasilitas.length} fasilitas, ${MASTER_DATA.tipeKamar.length} tipe kamar, ${MASTER_DATA.peraturan.length} peraturan, ${MASTER_DATA.layananLaundry.length} layanan laundry`
  );
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
      },
    });
    users.push(user);
  }
  console.log(`✅ Created ${users.length} users`);
  return users;
}

async function createSampleKost(users) {
  console.log("🏠 Creating Sample Kost...");
  const tipeKamar = await prisma.masterTipeKamar.findMany();
  const pengelola = users.filter((u) => u.role === "PENGELOLA");

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
      is_approved: true,
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
      is_approved: true,
    },
  ];
  const kosts = await Promise.all(
    kostData.map((data) => prisma.kost.create({ data }))
  );
  console.log(`✅ Created ${kosts.length} kost`);
  return kosts;
}

async function linkKostFasilitas(kosts) {
  console.log("🔗 Linking Kost Fasilitas...");
  const fasilitas = await prisma.masterFasilitas.findMany();
  const commonFasilitasIds = fasilitas.slice(0, 8).map((f) => f.fasilitas_id);

  for (const kost of kosts) {
    await prisma.kostFasilitas.createMany({
      data: commonFasilitasIds.map((fasilitas_id) => ({
        kost_id: kost.kost_id,
        fasilitas_id: fasilitas_id,
      })),
    });
  }
  console.log("✅ Linked fasilitas to kost");
}

async function linkKostPeraturan(kosts) {
  console.log("📋 Linking Kost Peraturan...");
  const peraturan = await prisma.masterPeraturan.findMany();
  const commonPeraturanIds = peraturan.slice(0, 5).map((p) => p.peraturan_id);

  for (const kost of kosts) {
    await prisma.kostPeraturan.createMany({
      data: commonPeraturanIds.map((peraturan_id) => ({
        kost_id: kost.kost_id,
        peraturan_id: peraturan_id,
      })),
    });
  }
  console.log("✅ Linked peraturan to kost");
}

async function createSampleReservasi(users, kosts) {
  console.log("📝 Creating Sample Reservasi...");
  const penghuni = users.find((u) => u.role === "PENGHUNI");
  const admin = users.find((u) => u.role === "ADMIN");
  const kostToReserve = kosts[0];

  const checkInDate = new Date();
  checkInDate.setMonth(checkInDate.getMonth() - 1); // 1 bulan lalu
  const durasiBulan = 6;
  const tanggalKeluar = new Date(checkInDate);
  tanggalKeluar.setMonth(tanggalKeluar.getMonth() + durasiBulan);

  const reservasi = await prisma.reservasi.create({
    data: {
      user_id: penghuni.user_id,
      kost_id: kostToReserve.kost_id,
      tanggal_check_in: checkInDate,
      durasi_bulan: durasiBulan,
      total_harga: kostToReserve.harga_bulanan * durasiBulan,
      status: "APPROVED",
      metode_bayar: "TRANSFER",
      validated_by: admin.user_id,
      validated_at: checkInDate,
      deposit_amount: kostToReserve.deposit,
      status_penghunian: "AKTIF",
      tanggal_keluar: tanggalKeluar,
    },
  });
  console.log("✅ Created sample reservasi");
  return reservasi;
}

async function createCateringServices(kosts) {
  console.log("🍽️ Creating Catering Services...");
  const caterings = [];
  for (let i = 0; i < MASTER_DATA.catering.length; i++) {
    const cateringData = {
      ...MASTER_DATA.catering[i],
      kost_id: kosts[i].kost_id,
      qris_image:
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
      rekening_info: {
        bank: i === 0 ? "BRI" : "BCA",
        nomor: i === 0 ? "1111222233334444" : "5555666677778888",
        atas_nama: MASTER_DATA.catering[i].nama_catering,
      },
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
    const menuData = MASTER_DATA.cateringMenus[i].map((menu) => ({
      ...menu,
      catering_id: caterings[i].catering_id,
      foto_menu:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
      is_available: true,
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
      qris_image:
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
      rekening_info: {
        bank: i === 0 ? "Mandiri" : "BCA",
        nomor: i === 0 ? "9999888877776666" : "3333444455556666",
        atas_nama: MASTER_DATA.laundry[i].nama_laundry,
      },
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
    const pricingData = MASTER_DATA.laundryHarga[i].map((pricing) => ({
      laundry_id: laundries[i].laundry_id,
      layanan_id: layananLaundry[pricing.layanan_index].layanan_id,
      harga_per_satuan: pricing.harga,
      is_available: true,
    }));
    await prisma.laundryHarga.createMany({ data: pricingData });
    totalPricing += pricingData.length;
  }
  console.log(`✅ Created ${totalPricing} laundry pricing items`);
}

async function createSampleOrders(users, sampleReservasi) {
  console.log("📦 Creating Sample Orders...");

  const penghuni = users.find((u) => u.role === "PENGHUNI");
  const admin = users.find((u) => u.role === "ADMIN");

  if (!penghuni || !admin || !sampleReservasi) {
    console.log(
      "⚠️ Skipping order creation: Missing essential data (penghuni, admin, or reservation)."
    );
    return;
  }

  // --- CATERING ORDER ---
  const kostCatering = await prisma.catering.findFirst({
    where: { kost_id: sampleReservasi.kost_id },
    include: { menu: true },
  });

  if (kostCatering && kostCatering.menu.length > 0) {
    const selectedMainDish = kostCatering.menu.find(
      (m) => m.kategori === "MAKANAN_BERAT"
    );
    const selectedDrink = kostCatering.menu.find(
      (m) => m.kategori === "MINUMAN"
    );

    let detailPesananCatering = [];
    if (selectedMainDish) {
      detailPesananCatering.push({
        menu_id: selectedMainDish.menu_id,
        jumlah_porsi: 1,
        harga_satuan: selectedMainDish.harga,
      });
    }
    if (selectedDrink) {
      detailPesananCatering.push({
        menu_id: selectedDrink.menu_id,
        jumlah_porsi: 1,
        harga_satuan: selectedDrink.harga,
      });
    }

    const totalCateringHarga = detailPesananCatering.reduce(
      (sum, item) => sum + item.harga_satuan * item.jumlah_porsi,
      0
    );

    if (totalCateringHarga > 0 && totalCateringHarga <= 999999.99) {
      const pesananCatering = await prisma.pesananCatering.create({
        data: {
          user_id: penghuni.user_id,
          reservasi_id: sampleReservasi.reservasi_id,
          total_harga: totalCateringHarga,
          status: "DITERIMA",
          catatan: "Pesanan makan siang harian.",
          detail_pesanan: { create: detailPesananCatering },
        },
      });

      await prisma.pembayaranCatering.create({
        data: {
          pesanan_id: pesananCatering.pesanan_id,
          jumlah: totalCateringHarga,
          metode: "QRIS",
          status: "VERIFIED",
          verified_by: admin.user_id,
          verified_at: new Date(),
        },
      });
      console.log(
        `✅ Created catering order (ID: ${pesananCatering.pesanan_id}) for reservation ${sampleReservasi.reservasi_id}. Total: ${totalCateringHarga}`
      );
    } else {
      console.log(
        `⚠️ Skipping catering order for reservation ${sampleReservasi.reservasi_id}: Total price (${totalCateringHarga}) is zero or exceeds DECIMAL(8,2) limit.`
      );
    }
  } else {
    console.log(
      `⚠️ Skipping catering order: No catering or menus found for kost ID ${sampleReservasi.kost_id}.`
    );
  }

  console.log("---");

  // --- LAUNDRY ORDER ---
  const kostLaundry = await prisma.laundry.findFirst({
    where: { kost_id: sampleReservasi.kost_id },
    include: {
      laundry_harga: {
        include: {
          layanan: true,
        },
      },
    },
  });

  if (kostLaundry && kostLaundry.laundry_harga.length > 0) {
    const cuciKeringLayanan = kostLaundry.laundry_harga.find(
      (lh) => lh.layanan && lh.layanan.nama_layanan === "Cuci Kering"
    );
    const setrikaSajaLayanan = kostLaundry.laundry_harga.find(
      (lh) => lh.layanan && lh.layanan.nama_layanan === "Setrika Saja"
    );

    let detailPesananLaundry = [];
    if (cuciKeringLayanan) {
      detailPesananLaundry.push({
        layanan_id: cuciKeringLayanan.layanan_id,
        jumlah_satuan: 2, // 2 kg
        harga_per_satuan: cuciKeringLayanan.harga_per_satuan,
      });
    }
    if (setrikaSajaLayanan) {
      detailPesananLaundry.push({
        layanan_id: setrikaSajaLayanan.layanan_id,
        jumlah_satuan: 5, // 5 pcs
        harga_per_satuan: setrikaSajaLayanan.harga_per_satuan,
      });
    }

    const totalLaundryHarga = detailPesananLaundry.reduce(
      (sum, item) => sum + item.harga_per_satuan * item.jumlah_satuan,
      0
    );

    if (totalLaundryHarga > 0 && totalLaundryHarga <= 999999.99) {
      const pesananLaundry = await prisma.pesananLaundry.create({
        data: {
          user_id: penghuni.user_id,
          laundry_id: kostLaundry.laundry_id,
          reservasi_id: sampleReservasi.reservasi_id,
          total_estimasi: totalLaundryHarga,
          total_final: totalLaundryHarga,
          berat_actual: 2.5,
          tanggal_antar: new Date(),
          estimasi_selesai: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          status: "PROSES",
          catatan: "Pakaian harian dan beberapa handuk.",
          detail_pesanan_laundry: { create: detailPesananLaundry },
        },
      });

      await prisma.pembayaranLaundry.create({
        data: {
          pesanan_id: pesananLaundry.pesanan_id,
          jumlah: totalLaundryHarga,
          metode: "TRANSFER",
          status: "VERIFIED",
          verified_by: admin.user_id,
          verified_at: new Date(),
        },
      });
      console.log(
        `✅ Created laundry order (ID: ${pesananLaundry.pesanan_id}) for reservation ${sampleReservasi.reservasi_id}. Total: ${totalLaundryHarga}`
      );
    } else {
      console.log(
        `⚠️ Skipping laundry order for reservation ${sampleReservasi.reservasi_id}: Total price (${totalLaundryHarga}) is zero or exceeds DECIMAL(8,2) limit.`
      );
    }
  } else {
    console.log(
      `⚠️ Skipping laundry order: No laundry service or pricing found for kost ID ${sampleReservasi.kost_id}.`
    );
  }
}

async function main() {
  console.log("🌱 Starting efficient database seeding...");

  try {

    await createMasterData();
    const users = await createUsers();
    const kosts = await createSampleKost(users);
    await linkKostFasilitas(kosts);
    await linkKostPeraturan(kosts);
    const sampleReservasi = await createSampleReservasi(users, kosts);
    const caterings = await createCateringServices(kosts);
    await createCateringMenus(caterings);
    const laundries = await createLaundryServices(kosts);
    await createLaundryPricing(laundries);

    await createSampleOrders(users, sampleReservasi);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   👥 Users: ${MASTER_DATA.users.length}`);
    console.log(`   🏠 Kost: ${kosts.length}`);
    console.log(`   🍽️ Catering: ${caterings.length} with menus`);
    console.log(`   🧺 Laundry: ${laundries.length} with pricing`);
    console.log(`   📋 Master Fasilitas: ${MASTER_DATA.fasilitas.length}`);
    console.log(`   📋 Master Tipe Kamar: ${MASTER_DATA.tipeKamar.length}`);
    console.log(`   📋 Master Peraturan: ${MASTER_DATA.peraturan.length}`);
    console.log(
      `   📋 Master Layanan Laundry: ${MASTER_DATA.layananLaundry.length}`
    );
    console.log(`   📦 Sample orders: Catering & Laundry with payments`);

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
