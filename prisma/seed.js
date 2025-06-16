const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // --- Master Data Creation ---
    console.log("📝 Creating Master Fasilitas...");
    const fasilitas = await Promise.all([
      // Fasilitas Umum
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "WiFi",
          kategori: "UMUM",
          icon: "wifi",
        },
      }),
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "CCTV",
          kategori: "UMUM",
          icon: "camera",
        },
      }),
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "Dapur Bersama",
          kategori: "UMUM",
          icon: "chef",
        },
      }),
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "Ruang Tamu",
          kategori: "UMUM",
          icon: "sofa",
        },
      }),
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "Laundry",
          kategori: "UMUM",
          icon: "washing-machine",
        },
      }),

      // Fasilitas Parkir
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "Parkir Motor",
          kategori: "PARKIR",
          icon: "motorcycle",
        },
      }),
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "Parkir Mobil",
          kategori: "PARKIR",
          icon: "car",
        },
      }),
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "Parkir Sepeda",
          kategori: "PARKIR",
          icon: "bicycle",
        },
      }),

      // Fasilitas Kamar (diasumsikan fasilitas standar di setiap unit kos)
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "AC",
          kategori: "KAMAR",
          icon: "snowflake",
        },
      }),
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "Kasur",
          kategori: "KAMAR",
          icon: "bed",
        },
      }),
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "Lemari",
          kategori: "KAMAR",
          icon: "cabinet",
        },
      }),
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "Meja Belajar",
          kategori: "KAMAR",
          icon: "desk",
        },
      }),
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "Kursi",
          kategori: "KAMAR",
          icon: "chair",
        },
      }),
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "TV",
          kategori: "KAMAR",
          icon: "tv",
        },
      }),
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "Kipas Angin",
          kategori: "KAMAR",
          icon: "fan",
        },
      }),

      // Fasilitas Kamar Mandi
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "Kamar Mandi Dalam",
          kategori: "KAMAR_MANDI",
          icon: "bathroom",
        },
      }),
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "Water Heater",
          kategori: "KAMAR_MANDI",
          icon: "water-heater",
        },
      }),
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "Shower",
          kategori: "KAMAR_MANDI",
          icon: "shower",
        },
      }),
      prisma.masterFasilitas.create({
        data: {
          nama_fasilitas: "Toilet Duduk",
          kategori: "KAMAR_MANDI",
          icon: "toilet",
        },
      }),
    ]);
    console.log(`✅ Created ${fasilitas.length} fasilitas`);

    console.log("📝 Creating Master Tipe Kamar...");
    const tipeKamar = await Promise.all([
      prisma.masterTipeKamar.create({
        data: {
          nama_tipe: "Standard Single",
          ukuran: "3x4 meter",
          kapasitas: 1,
          deskripsi: "Kamar standar untuk 1 orang dengan fasilitas dasar",
        },
      }),
      prisma.masterTipeKamar.create({
        data: {
          nama_tipe: "Premium Single",
          ukuran: "4x5 meter",
          kapasitas: 1,
          deskripsi: "Kamar premium untuk 1 orang dengan fasilitas lengkap",
        },
      }),
      prisma.masterTipeKamar.create({
        data: {
          nama_tipe: "Deluxe Double",
          ukuran: "4x5 meter",
          kapasitas: 2,
          deskripsi: "Kamar deluxe untuk 2 orang dengan fasilitas lebih",
        },
      }),
    ]);
    console.log(`✅ Created ${tipeKamar.length} tipe kamar`);

    console.log("📝 Creating Master Peraturan...");
    const peraturan = await Promise.all([
      // Peraturan Kost Umum
      prisma.masterPeraturan.create({
        data: {
          nama_peraturan: "Tidak boleh membawa tamu menginap",
          kategori: "KOST_UMUM",
          icon: "user-x",
        },
      }),
      prisma.masterPeraturan.create({
        data: {
          nama_peraturan: "Jam malam 22:00 WIB",
          kategori: "KOST_UMUM",
          icon: "clock",
        },
      }),
      prisma.masterPeraturan.create({
        data: {
          nama_peraturan: "Dilarang merokok di dalam kamar",
          kategori: "KOST_UMUM",
          icon: "no-smoking",
        },
      }),
      prisma.masterPeraturan.create({
        data: {
          nama_peraturan: "Wajib menjaga kebersihan",
          kategori: "KOST_UMUM",
          icon: "broom",
        },
      }),
      prisma.masterPeraturan.create({
        data: {
          nama_peraturan: "Dilarang membawa hewan peliharaan",
          kategori: "KOST_UMUM",
          icon: "pet-off",
        },
      }),
      prisma.masterPeraturan.create({
        data: {
          nama_peraturan: "Wajib lapor jika keluar lebih dari 3 hari",
          kategori: "KOST_UMUM",
          icon: "calendar",
        },
      }),

      // Peraturan Tipe Kamar (Sekarang diaplikasikan sebagai peraturan umum kos tersebut)
      prisma.masterPeraturan.create({
        data: {
          nama_peraturan: "Tidak boleh memasak di kamar",
          kategori: "TIPE_KAMAR",
          icon: "chef-off",
        },
      }),
      prisma.masterPeraturan.create({
        data: {
          nama_peraturan: "Wajib mematikan listrik saat keluar",
          kategori: "TIPE_KAMAR",
          icon: "power-off",
        },
      }),
      prisma.masterPeraturan.create({
        data: {
          nama_peraturan: "Maksimal 2 orang per kamar single",
          kategori: "TIPE_KAMAR",
          icon: "users",
        },
      }),
      prisma.masterPeraturan.create({
        data: {
          nama_peraturan: "Dilarang menggunakan alat elektronik berlebihan",
          kategori: "TIPE_KAMAR",
          icon: "zap-off",
        },
      }),
    ]);
    console.log(`✅ Created ${peraturan.length} peraturan`);

    console.log("📝 Creating Master Layanan Laundry...");
    const layananLaundry = await Promise.all([
      prisma.masterLayananLaundry.create({
        data: {
          nama_layanan: "Cuci Kering",
          satuan: "kg",
        },
      }),
      prisma.masterLayananLaundry.create({
        data: {
          nama_layanan: "Cuci Setrika",
          satuan: "kg",
        },
      }),
      prisma.masterLayananLaundry.create({
        data: {
          nama_layanan: "Setrika Saja",
          satuan: "pcs",
        },
      }),
      prisma.masterLayananLaundry.create({
        data: {
          nama_layanan: "Dry Clean",
          satuan: "pcs",
        },
      }),
      prisma.masterLayananLaundry.create({
        data: {
          nama_layanan: "Cuci Sepatu",
          satuan: "pcs",
        },
      }),
      prisma.masterLayananLaundry.create({
        data: {
          nama_layanan: "Cuci Selimut",
          satuan: "pcs",
        },
      }),
    ]);
    console.log(`✅ Created ${layananLaundry.length} layanan laundry`);

    // --- User Creation ---
    console.log("📝 Creating Users...");

    const adminUser = await prisma.users.create({
      data: {
        email: "admin@kosan.com",
        username: "admin",
        password: await bcrypt.hash("Admin123!", 12),
        full_name: "System Administrator",
        role: "ADMIN",
        phone: "081234567890",
        whatsapp_number: "081234567890",
        is_approved: true,
        email_verified: true,
      },
    });

    const pengelola1 = await prisma.users.create({
      data: {
        email: "pengelola1@gmail.com",
        username: "pengelola1",
        password: await bcrypt.hash("Pengelola123!", 12),
        full_name: "Budi Santoso",
        role: "PENGELOLA",
        phone: "081234567891",
        whatsapp_number: "081234567891",
        is_approved: true,
        email_verified: true,
      },
    });

    const pengelola2 = await prisma.users.create({
      data: {
        email: "pengelola2@gmail.com",
        username: "pengelola2",
        password: await bcrypt.hash("Pengelola123!", 12),
        full_name: "Siti Rahayu",
        role: "PENGELOLA",
        phone: "081234567892",
        whatsapp_number: "081234567892",
        is_approved: true,
        email_verified: true,
      },
    });

    const penghuni1 = await prisma.users.create({
      data: {
        email: "penghuni1@gmail.com",
        username: "penghuni1",
        password: await bcrypt.hash("Penghuni123!", 12),
        full_name: "Ahmad Fauzi",
        role: "PENGHUNI",
        phone: "081234567893",
        whatsapp_number: "081234567893",
        is_approved: true,
        email_verified: true,
      },
    });

    const penghuni2 = await prisma.users.create({
      data: {
        email: "penghuni2@gmail.com",
        username: "penghuni2",
        password: await bcrypt.hash("Penghuni123!", 12),
        full_name: "Maya Sari",
        role: "PENGHUNI",
        phone: "081234567894",
        whatsapp_number: "081234567894",
        is_approved: true,
        email_verified: true,
      },
    });

    const penghuni3 = await prisma.users.create({
      data: {
        email: "penghuni3@gmail.com",
        username: "penghuni3",
        password: await bcrypt.hash("Penghuni123!", 12),
        full_name: "Rizki Pratama",
        role: "PENGHUNI",
        phone: "081234567895",
        whatsapp_number: "081234567895",
        is_approved: true,
        email_verified: true,
      },
    });

    console.log("✅ Created 6 users (1 admin, 2 pengelola, 3 penghuni)");

    // --- Kost Creation (Now includes room-like details) ---
    console.log("📝 Creating Kost...");
    const kost1 = await prisma.kost.create({
      data: {
        pengelola_id: pengelola1.user_id,
        nama_kost: "Kost Merdeka Raya (Tipe Standard Single)", // Updated name to reflect type
        alamat:
          "Jl. Merdeka Raya No. 123, Menteng, Jakarta Pusat, DKI Jakarta 10310",
        gmaps_link: "https://goo.gl/maps/example1",
        deskripsi:
          "Kost nyaman dan strategis di pusat kota Jakarta. Semua kamar bertipe Standard Single dengan fasilitas standar dan keamanan 24 jam.",
        total_kamar: 20,
        daya_listrik: "1300 VA",
        sumber_air: "PDAM",
        wifi_speed: "Indihome 50 Mbps",
        kapasitas_parkir_motor: 15,
        kapasitas_parkir_mobil: 5,
        kapasitas_parkir_sepeda: 10,
        biaya_tambahan: 50000,
        jam_survey: "08:00 - 21:00 WIB",
        foto_kost: [
          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
        ],
        qris_image:
          "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
        rekening_info: {
          bank: "BCA",
          nomor: "1234567890",
          atas_nama: "Budi Santoso",
        },
        is_approved: true,
        tipe_id: tipeKamar[0].tipe_id, // Link to 'Standard Single'
        harga_bulanan: 1500000,
        deposit: 1500000,
        harga_final: 1550000, // harga_bulanan + biaya_tambahan
      },
    });

    const kost2 = await prisma.kost.create({
      data: {
        pengelola_id: pengelola2.user_id,
        nama_kost: "Kost Sudirman Residence (Tipe Premium Single)", // Updated name to reflect type
        alamat:
          "Jl. Sudirman No. 456, Setiabudi, Jakarta Selatan, DKI Jakarta 12920",
        gmaps_link: "https://goo.gl/maps/example2",
        deskripsi:
          "Kost eksklusif dengan pemandangan kota Jakarta. Semua kamar bertipe Premium Single dengan fasilitas premium dan pelayanan seperti hotel.",
        total_kamar: 30,
        daya_listrik: "2200 VA",
        sumber_air: "PDAM + Filter",
        wifi_speed: "Fiber Optic 100 Mbps",
        kapasitas_parkir_motor: 25,
        kapasitas_parkir_mobil: 10,
        kapasitas_parkir_sepeda: 15,
        biaya_tambahan: 75000,
        jam_survey: "07:00 - 22:00 WIB",
        foto_kost: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
          "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800",
        ],
        qris_image:
          "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
        rekening_info: {
          bank: "Mandiri",
          nomor: "0987654321",
          atas_nama: "Siti Rahayu",
        },
        is_approved: true,
        tipe_id: tipeKamar[1].tipe_id, // Link to 'Premium Single'
        harga_bulanan: 3000000,
        deposit: 3000000,
        harga_final: 3075000, // harga_bulanan + biaya_tambahan
      },
    });

    console.log("✅ Created 2 kost");

    console.log("📝 Adding Fasilitas to Kost...");

    // Kost 1 Fasilitas (Includes assumed "room facilities" from KAMAR and KAMAR_MANDI categories)
    const kost1FasilitasIds = [
      fasilitas[0].fasilitas_id, // WiFi (UMUM)
      fasilitas[1].fasilitas_id, // CCTV (UMUM)
      fasilitas[2].fasilitas_id, // Dapur Bersama (UMUM)
      fasilitas[4].fasilitas_id, // Laundry (UMUM)
      fasilitas[5].fasilitas_id, // Parkir Motor (PARKIR)
      fasilitas[9].fasilitas_id, // Kasur (KAMAR)
      fasilitas[10].fasilitas_id, // Lemari (KAMAR)
      fasilitas[11].fasilitas_id, // Meja Belajar (KAMAR)
      fasilitas[12].fasilitas_id, // Kursi (KAMAR)
      fasilitas[14].fasilitas_id, // Kipas Angin (KAMAR)
      fasilitas[15].fasilitas_id, // Kamar Mandi Dalam (KAMAR_MANDI)
    ];

    await Promise.all(
      kost1FasilitasIds.map((fasilitas_id) =>
        prisma.kostFasilitas.create({
          data: { kost_id: kost1.kost_id, fasilitas_id },
        })
      )
    );

    // Kost 2 Fasilitas (Includes assumed "room facilities" for Premium type)
    const kost2FasilitasIds = [
      fasilitas[0].fasilitas_id, // WiFi (UMUM)
      fasilitas[1].fasilitas_id, // CCTV (UMUM)
      fasilitas[2].fasilitas_id, // Dapur Bersama (UMUM)
      fasilitas[3].fasilitas_id, // Ruang Tamu (UMUM)
      fasilitas[4].fasilitas_id, // Laundry (UMUM)
      fasilitas[5].fasilitas_id, // Parkir Motor (PARKIR)
      fasilitas[6].fasilitas_id, // Parkir Mobil (PARKIR)
      fasilitas[8].fasilitas_id, // AC (KAMAR)
      fasilitas[9].fasilitas_id, // Kasur (KAMAR)
      fasilitas[10].fasilitas_id, // Lemari (KAMAR)
      fasilitas[11].fasilitas_id, // Meja Belajar (KAMAR)
      fasilitas[12].fasilitas_id, // Kursi (KAMAR)
      fasilitas[13].fasilitas_id, // TV (KAMAR)
      fasilitas[15].fasilitas_id, // Kamar Mandi Dalam (KAMAR_MANDI)
      fasilitas[16].fasilitas_id, // Water Heater (KAMAR_MANDI)
    ];

    await Promise.all(
      kost2FasilitasIds.map((fasilitas_id) =>
        prisma.kostFasilitas.create({
          data: { kost_id: kost2.kost_id, fasilitas_id },
        })
      )
    );

    console.log("✅ Added fasilitas to kost");

    console.log("📝 Adding Peraturan to Kost...");

    // Kost 1 Peraturan
    const kost1PeraturanIds = [
      peraturan[0].peraturan_id, // Tidak boleh membawa tamu menginap
      peraturan[1].peraturan_id, // Jam malam 22:00 WIB
      peraturan[2].peraturan_id, // Dilarang merokok di dalam kamar (ini jadi peraturan kos)
      peraturan[3].peraturan_id, // Wajib menjaga kebersihan
      peraturan[6].peraturan_id, // Tidak boleh memasak di kamar (ini jadi peraturan kos)
      peraturan[7].peraturan_id, // Wajib mematikan listrik saat keluar
    ];

    await Promise.all(
      kost1PeraturanIds.map((peraturan_id) =>
        prisma.kostPeraturan.create({
          data: {
            kost_id: kost1.kost_id,
            peraturan_id: peraturan_id,
            keterangan_tambahan:
              peraturan_id === peraturan[0].peraturan_id
                ? "Tamu hanya boleh berkunjung sampai jam 20:00 WIB"
                : peraturan_id === peraturan[1].peraturan_id
                ? "Pintu utama ditutup jam 22:00 WIB"
                : null,
          },
        })
      )
    );

    // Kost 2 Peraturan
    const kost2PeraturanIds = [
      peraturan[0].peraturan_id, // Tidak boleh membawa tamu menginap
      peraturan[1].peraturan_id, // Jam malam 22:00 WIB
      peraturan[2].peraturan_id, // Dilarang merokok di dalam kamar
      peraturan[4].peraturan_id, // Dilarang membawa hewan peliharaan
      peraturan[5].peraturan_id, // Wajib lapor jika keluar lebih dari 3 hari
      peraturan[8].peraturan_id, // Maksimal 2 orang per kamar single (ini jadi peraturan kos)
      peraturan[9].peraturan_id, // Dilarang menggunakan alat elektronik berlebihan
    ];

    await Promise.all(
      kost2PeraturanIds.map((peraturan_id) =>
        prisma.kostPeraturan.create({
          data: {
            kost_id: kost2.kost_id,
            peraturan_id: peraturan_id,
            keterangan_tambahan:
              peraturan_id === peraturan[0].peraturan_id
                ? "Tamu menginap dikenakan biaya Rp 50.000/malam"
                : peraturan_id === peraturan[1].peraturan_id
                ? "Akses kartu berlaku 24 jam untuk penghuni VIP"
                : null,
          },
        })
      )
    );

    console.log("✅ Added peraturan to kost");

    // --- Reservasi Creation (Now linked directly to Kost and includes penghuni details) ---
    console.log("📝 Creating Reservasi...");

    const penghuniUsers = [penghuni1, penghuni2, penghuni3];
    const kostsForReservation = [kost1, kost2];

    // Reservasi 1 for Kost 1 (ACTIVE Penghuni)
    const checkInDate1 = new Date();
    checkInDate1.setMonth(checkInDate1.getMonth() - 2); // 2 months ago
    const reservasi1 = await prisma.reservasi.create({
      data: {
        user_id: penghuniUsers[0].user_id,
        kost_id: kostsForReservation[0].kost_id,
        tanggal_check_in: checkInDate1,
        durasi_bulan: 12,
        total_harga: kostsForReservation[0].harga_bulanan * 12,
        bukti_bayar:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
        status: "APPROVED",
        metode_bayar: "TRANSFER",
        validated_by: adminUser.user_id,
        validated_at: checkInDate1,
        deposit_amount: kostsForReservation[0].deposit,
        status_penghunian: "AKTIF",
      },
    });

    // Reservasi 2 for Kost 1 (ACTIVE Penghuni)
    const checkInDate2 = new Date();
    checkInDate2.setMonth(checkInDate2.getMonth() - 1); // 1 month ago
    const reservasi2 = await prisma.reservasi.create({
      data: {
        user_id: penghuniUsers[1].user_id,
        kost_id: kostsForReservation[0].kost_id,
        tanggal_check_in: checkInDate2,
        durasi_bulan: 6,
        total_harga: kostsForReservation[0].harga_bulanan * 6,
        bukti_bayar:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
        status: "APPROVED",
        metode_bayar: "QRIS",
        validated_by: adminUser.user_id,
        validated_at: checkInDate2,
        deposit_amount: kostsForReservation[0].deposit,
        status_penghunian: "AKTIF",
      },
    });

    // Reservasi 3 for Kost 2 (PENDING Validation)
    const checkInDate3 = new Date(); // Today
    const reservasi3 = await prisma.reservasi.create({
      data: {
        user_id: penghuniUsers[2].user_id,
        kost_id: kostsForReservation[1].kost_id,
        tanggal_check_in: checkInDate3,
        durasi_bulan: 3,
        total_harga: kostsForReservation[1].harga_bulanan * 3,
        bukti_bayar:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
        status: "PENDING",
        metode_bayar: "TRANSFER",
      },
    });

    console.log(`✅ Created 3 reservasi`);

    // --- Catering Services ---
    console.log("📝 Creating Catering...");

    const catering1 = await prisma.catering.create({
      data: {
        kost_id: kost1.kost_id,
        nama_catering: "Warung Bu Tini",
        alamat: "Jl. Merdeka Raya No. 125, Jakarta Pusat",
        whatsapp_number: "081234567896",
        qris_image:
          "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
        rekening_info: {
          bank: "BRI",
          nomor: "1111222233334444",
          atas_nama: "Tini Suhartini",
        },
        is_partner: true,
        is_active: true,
      },
    });

    const catering2 = await prisma.catering.create({
      data: {
        kost_id: kost2.kost_id,
        nama_catering: "Dapur Sehat Mama",
        alamat: "Jl. Sudirman No. 458, Jakarta Selatan",
        whatsapp_number: "081234567897",
        qris_image:
          "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
        rekening_info: {
          bank: "BCA",
          nomor: "5555666677778888",
          atas_nama: "Sari Dewi",
        },
        is_partner: false,
        is_active: true,
      },
    });

    console.log("✅ Created 2 catering");

    console.log("📝 Creating Catering Menu...");

    const cateringMenus = [];

    // Catering 1 Menu
    const catering1Menus = await Promise.all([
      prisma.cateringMenu.create({
        data: {
          catering_id: catering1.catering_id,
          nama_menu: "Nasi Gudeg Jogja",
          kategori: "MAKANAN_BERAT",
          harga: 15000,
          foto_menu:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
          is_available: true,
        },
      }),
      prisma.cateringMenu.create({
        data: {
          catering_id: catering1.catering_id,
          nama_menu: "Nasi Ayam Bakar",
          kategori: "MAKANAN_BERAT",
          harga: 18000,
          foto_menu:
            "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
          is_available: true,
        },
      }),
      prisma.cateringMenu.create({
        data: {
          catering_id: catering1.catering_id,
          nama_menu: "Gado-gado",
          kategori: "MAKANAN_BERAT",
          harga: 12000,
          foto_menu:
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
          is_available: true,
        },
      }),
      prisma.cateringMenu.create({
        data: {
          catering_id: catering1.catering_id,
          nama_menu: "Es Teh Manis",
          kategori: "MINUMAN",
          harga: 5000,
          foto_menu:
            "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400",
          is_available: true,
        },
      }),
      prisma.cateringMenu.create({
        data: {
          catering_id: catering1.catering_id,
          nama_menu: "Kerupuk",
          kategori: "SNACK",
          harga: 3000,
          foto_menu:
            "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400",
          is_available: true,
        },
      }),
    ]);

    // Catering 2 Menu
    const catering2Menus = await Promise.all([
      prisma.cateringMenu.create({
        data: {
          catering_id: catering2.catering_id,
          nama_menu: "Salmon Teriyaki Bowl",
          kategori: "MAKANAN_BERAT",
          harga: 35000,
          foto_menu:
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
          is_available: true,
        },
      }),
      prisma.cateringMenu.create({
        data: {
          catering_id: catering2.catering_id,
          nama_menu: "Chicken Caesar Salad",
          kategori: "MAKANAN_BERAT",
          harga: 28000,
          foto_menu:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
          is_available: true,
        },
      }),
      prisma.cateringMenu.create({
        data: {
          catering_id: catering2.catering_id,
          nama_menu: "Smoothie Bowl",
          kategori: "SNACK",
          harga: 22000,
          foto_menu:
            "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400",
          is_available: true,
        },
      }),
      prisma.cateringMenu.create({
        data: {
          catering_id: catering2.catering_id,
          nama_menu: "Fresh Orange Juice",
          kategori: "MINUMAN",
          harga: 15000,
          foto_menu:
            "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400",
          is_available: true,
        },
      }),
      prisma.cateringMenu.create({
        data: {
          catering_id: catering2.catering_id,
          nama_menu: "Green Tea Latte",
          kategori: "MINUMAN",
          harga: 18000,
          foto_menu:
            "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
          is_available: true,
        },
      }),
    ]);

    cateringMenus.push(...catering1Menus, ...catering2Menus);
    console.log(`✅ Created ${cateringMenus.length} catering menu items`);

    console.log("📝 Creating Sample Pesanan Catering (Multiple Items)...");

    const cateringOrder1Items = [
      { menu: catering1Menus[0], qty: 2 },
      { menu: catering1Menus[3], qty: 3 },
      { menu: catering1Menus[4], qty: 1 },
    ];
    const totalHargaCatering1 = cateringOrder1Items.reduce(
      (sum, item) => sum + item.menu.harga * item.qty,
      0
    );

    const pesananCatering1 = await prisma.pesananCatering.create({
      data: {
        user_id: penghuni1.user_id,
        total_harga: totalHargaCatering1,
        status: "DITERIMA",
        catatan: "Gudeg pedas, teh jangan terlalu manis",
        detail_pesanan: {
          create: cateringOrder1Items.map((item) => ({
            menu_id: item.menu.menu_id,
            jumlah_porsi: item.qty,
            harga_satuan: item.menu.harga,
          })),
        },
      },
    });

    const cateringOrder2Items = [
      { menu: catering2Menus[0], qty: 1 },
      { menu: catering2Menus[3], qty: 2 },
    ];
    const totalHargaCatering2 = cateringOrder2Items.reduce(
      (sum, item) => sum + item.menu.harga * item.qty,
      0
    );

    const pesananCatering2 = await prisma.pesananCatering.create({
      data: {
        user_id: penghuni2.user_id,
        total_harga: totalHargaCatering2,
        status: "PROSES",
        catatan: "Packing rapih",
        detail_pesanan: {
          create: cateringOrder2Items.map((item) => ({
            menu_id: item.menu.menu_id,
            jumlah_porsi: item.qty,
            harga_satuan: item.menu.harga,
          })),
        },
      },
    });

    await prisma.pembayaranCatering.create({
      data: {
        pesanan_id: pesananCatering1.pesanan_id,
        jumlah: pesananCatering1.total_harga,
        metode: "QRIS",
        bukti_bayar:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
        status: "VERIFIED",
        verified_by: adminUser.user_id,
        verified_at: new Date(),
      },
    });
    await prisma.pembayaranCatering.create({
      data: {
        pesanan_id: pesananCatering2.pesanan_id,
        jumlah: pesananCatering2.total_harga,
        metode: "TRANSFER",
        bukti_bayar:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
        status: "VERIFIED",
        verified_by: adminUser.user_id,
        verified_at: new Date(),
      },
    });

    console.log(`✅ Created 2 pesanan catering with payments (multi-item)`);

    // --- Laundry Services ---
    console.log("📝 Creating Laundry...");

    const laundry1 = await prisma.laundry.create({
      data: {
        kost_id: kost1.kost_id,
        nama_laundry: "Laundry Express 24 Jam",
        alamat: "Jl. Merdeka Raya No. 127, Jakarta Pusat",
        whatsapp_number: "081234567898",
        qris_image:
          "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
        rekening_info: {
          bank: "Mandiri",
          nomor: "9999888877776666",
          atas_nama: "Laundry Express",
        },
        is_partner: true,
        is_active: true,
      },
    });

    const laundry2 = await prisma.laundry.create({
      data: {
        kost_id: kost2.kost_id,
        nama_laundry: "Premium Clean Laundry",
        alamat: "Jl. Sudirman No. 460, Jakarta Selatan",
        whatsapp_number: "081234567899",
        qris_image:
          "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
        rekening_info: {
          bank: "BCA",
          nomor: "3333444455556666",
          atas_nama: "Premium Clean",
        },
        is_partner: false,
        is_active: true,
      },
    });

    console.log("✅ Created 2 laundry services");

    console.log("📝 Creating Laundry Harga...");

    const laundry1HargaItems = await Promise.all([
      prisma.laundryHarga.create({
        data: {
          laundry_id: laundry1.laundry_id,
          layanan_id: layananLaundry[0].layanan_id,
          harga_per_satuan: 8000,
          is_available: true,
        },
      }),
      prisma.laundryHarga.create({
        data: {
          laundry_id: laundry1.laundry_id,
          layanan_id: layananLaundry[1].layanan_id,
          harga_per_satuan: 12000,
          is_available: true,
        },
      }),
      prisma.laundryHarga.create({
        data: {
          laundry_id: laundry1.laundry_id,
          layanan_id: layananLaundry[2].layanan_id,
          harga_per_satuan: 5000,
          is_available: true,
        },
      }),
      prisma.laundryHarga.create({
        data: {
          laundry_id: laundry1.laundry_id,
          layanan_id: layananLaundry[4].layanan_id,
          harga_per_satuan: 15000,
          is_available: true,
        },
      }),
    ]);

    const laundry2HargaItems = await Promise.all([
      prisma.laundryHarga.create({
        data: {
          laundry_id: laundry2.laundry_id,
          layanan_id: layananLaundry[0].layanan_id,
          harga_per_satuan: 12000,
          is_available: true,
        },
      }),
      prisma.laundryHarga.create({
        data: {
          laundry_id: laundry2.laundry_id,
          layanan_id: layananLaundry[1].layanan_id,
          harga_per_satuan: 18000,
          is_available: true,
        },
      }),
      prisma.laundryHarga.create({
        data: {
          laundry_id: laundry2.laundry_id,
          layanan_id: layananLaundry[3].layanan_id,
          harga_per_satuan: 35000,
          is_available: true,
        },
      }),
      prisma.laundryHarga.create({
        data: {
          laundry_id: laundry2.laundry_id,
          layanan_id: layananLaundry[5].layanan_id,
          harga_per_satuan: 25000,
          is_available: true,
        },
      }),
    ]);

    console.log(
      `✅ Created ${
        laundry1HargaItems.length + laundry2HargaItems.length
      } laundry pricing`
    );

    console.log("📝 Creating Sample Pesanan Laundry (Multiple Items)...");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const laundryOrder1Items = [
      {
        layanan: layananLaundry[1],
        qty: 3,
        hargaSatuan: laundry1HargaItems[1].harga_per_satuan,
      },
      {
        layanan: layananLaundry[4],
        qty: 1,
        hargaSatuan: laundry1HargaItems[3].harga_per_satuan,
      },
    ];
    const totalEstimasiLaundry1 = laundryOrder1Items.reduce(
      (sum, item) => sum + item.hargaSatuan * item.qty,
      0
    );

    const pesananLaundry1 = await prisma.pesananLaundry.create({
      data: {
        user_id: penghuni1.user_id,
        laundry_id: laundry1.laundry_id,
        total_estimasi: totalEstimasiLaundry1,
        total_final: totalEstimasiLaundry1 + 6000,
        berat_actual: 3.5,
        tanggal_antar: new Date(),
        estimasi_selesai: tomorrow,
        status: "PROSES",
        catatan: "Jangan pakai pelembut",
        detail_pesanan_laundry: {
          create: laundryOrder1Items.map((item) => ({
            layanan_id: item.layanan.layanan_id,
            jumlah_satuan: item.qty,
            harga_per_satuan: item.hargaSatuan,
          })),
        },
      },
    });

    const laundryOrder2Items = [
      {
        layanan: layananLaundry[3],
        qty: 2,
        hargaSatuan: laundry2HargaItems[2].harga_per_satuan,
      },
      {
        layanan: layananLaundry[5],
        qty: 1,
        hargaSatuan: laundry2HargaItems[3].harga_per_satuan,
      },
    ];
    const totalEstimasiLaundry2 = laundryOrder2Items.reduce(
      (sum, item) => sum + item.hargaSatuan * item.qty,
      0
    );

    const pesananLaundry2 = await prisma.pesananLaundry.create({
      data: {
        user_id: penghuni2.user_id,
        laundry_id: laundry2.laundry_id,
        total_estimasi: totalEstimasiLaundry2,
        total_final: totalEstimasiLaundry2,
        berat_actual: null,
        tanggal_antar: new Date(),
        estimasi_selesai: dayAfterTomorrow,
        status: "DITERIMA",
        catatan: "Jas kantor dan dress",
        detail_pesanan_laundry: {
          create: laundryOrder2Items.map((item) => ({
            layanan_id: item.layanan.layanan_id,
            jumlah_satuan: item.qty,
            harga_per_satuan: item.hargaSatuan,
          })),
        },
      },
    });

    await prisma.pembayaranLaundry.create({
      data: {
        pesanan_id: pesananLaundry1.pesanan_id,
        jumlah: pesananLaundry1.total_final || pesananLaundry1.total_estimasi,
        metode: "TRANSFER",
        bukti_bayar:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
        status: "VERIFIED",
        verified_by: adminUser.user_id,
        verified_at: new Date(),
      },
    });
    await prisma.pembayaranLaundry.create({
      data: {
        pesanan_id: pesananLaundry2.pesanan_id,
        jumlah: pesananLaundry2.total_final || pesananLaundry2.total_estimasi,
        metode: "QRIS",
        bukti_bayar:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
        status: "VERIFIED",
        verified_by: adminUser.user_id,
        verified_at: new Date(),
      },
    });

    console.log(`✅ Created 2 pesanan laundry with payments (multi-item)`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   👥 Users: 6 (1 Admin, 2 Pengelola, 3 Penghuni)`);
    console.log(`   🏠 Kost: 2`);
    console.log(`   📝 Reservasi: 3`);
    console.log(`   📋 Master Fasilitas: ${fasilitas.length}`);
    console.log(`   📋 Master Tipe Kamar: ${tipeKamar.length}`);
    console.log(`   📋 Master Peraturan: ${peraturan.length}`);
    console.log(`   📋 Master Layanan Laundry: ${layananLaundry.length}`);
    console.log(`   🍽️ Catering: 2 with ${cateringMenus.length} menu items`);
    console.log(`   🧺 Laundry: 2 with pricing`);
    console.log(`   🍕 Pesanan Catering: 2 (multi-item)`);
    console.log(`   👔 Pesanan Laundry: 2 (multi-item)`);

    console.log("\n🔑 Default Login Credentials:");
    console.log("   Admin: admin@kosan.com / Admin123!");
    console.log("   Pengelola 1: pengelola1@gmail.com / Pengelola123!");
    console.log("   Pengelola 2: pengelola2@gmail.com / Pengelola123!");
    console.log("   Penghuni 1: penghuni1@gmail.com / Penghuni123!");
    console.log("   Penghuni 2: penghuni2@gmail.com / Penghuni123!");
    console.log("   Penghuni 3: penghuni3@gmail.com / Penghuni123!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Database connection closed");
  }
}

main().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
